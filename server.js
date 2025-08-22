const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Validate required environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'SESSION_SECRET'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

// Google OAuth v3 Configuration
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes for Google APIs
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

// Store tokens in memory (in production, use a database)
const tokenStore = new Map();

// Helpers for token expiry handling
function getExpiryMs(expiry) {
  if (!expiry) return 0;
  if (typeof expiry === 'number') return expiry;
  const parsed = new Date(expiry).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function computeExpiryDateMs(tokens) {
  // Prefer explicit expiry_date from Google if provided
  if (tokens && tokens.expiry_date != null) {
    const ms = typeof tokens.expiry_date === 'number' ? tokens.expiry_date : new Date(tokens.expiry_date).getTime();
    if (Number.isFinite(ms)) return ms;
  }
  // Fallback to expires_in seconds
  if (tokens && tokens.expires_in != null) {
    const seconds = Number(tokens.expires_in);
    if (Number.isFinite(seconds)) return Date.now() + seconds * 1000;
  }
  // Safe default: treat as 55 minutes from now if none provided
  return Date.now() + 55 * 60 * 1000;
}

// Utility function to check if token is expired (with small skew)
function isTokenExpired(expiryDate, skewMs = 120000) {
  const expiryMs = getExpiryMs(expiryDate);
  if (!expiryMs) return true;
  return Date.now() >= (expiryMs - skewMs);
}

// Utility function to refresh token automatically
async function refreshTokenIfNeeded(userId) {
  const userTokens = tokenStore.get(userId);
  if (!userTokens) return null;

  if (isTokenExpired(userTokens.expiry_date)) {
    try {
      oauth2Client.setCredentials({
        refresh_token: userTokens.refresh_token
      });

      const { credentials } = await oauth2Client.refreshAccessToken();

      // Update stored tokens
      const updatedTokens = {
        access_token: credentials.access_token,
        refresh_token: userTokens.refresh_token, // Keep the same refresh token
        expiry_date: computeExpiryDateMs(credentials),
        scope: credentials.scope
      };
      
      tokenStore.set(userId, updatedTokens);
      console.log(`Token refreshed for user: ${userId}`);
      return updatedTokens;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Remove invalid tokens
      tokenStore.delete(userId);
      return null;
    }
  }
  
  return userTokens;
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Google OAuth v3 Login
app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // This enables refresh token
    scope: SCOPES,
    prompt: 'consent' // Force consent to ensure refresh token is provided
  });
  res.redirect(authUrl);
});

// Google OAuth v3 Callback
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Get user info
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();
    
    // Store tokens with user ID
    const userId = userInfo.id;
    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: computeExpiryDateMs(tokens),
      scope: tokens.scope
    };
    
    tokenStore.set(userId, tokenData);
    
    // Store user info in session
    req.session.userId = userId;
    req.session.userInfo = userInfo;
    
    console.log(`User authenticated: ${userInfo.email}`);
    res.redirect('/dashboard');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/?error=auth_failed');
  }
});

// Dashboard - Protected route
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  res.sendFile(__dirname + '/public/dashboard.html');
});

// API endpoint to get user profile with automatic token refresh
app.get('/api/profile', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = req.session.userId;
    const tokens = await refreshTokenIfNeeded(userId);
    
    if (!tokens) {
      return res.status(401).json({ error: 'Invalid or expired tokens' });
    }

    // Use refreshed tokens to get user info
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();
    
    const expiresInSeconds = Math.max(0, Math.floor((getExpiryMs(tokens.expiry_date) - Date.now()) / 1000));

    res.json({
      user: userInfo,
      tokens: {
        access_token: tokens.access_token,
        expires_in: expiresInSeconds,
        scope: tokens.scope
      }
    });
  } catch (error) {
    console.error('Profile API error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Logout
app.get('/logout', (req, res) => {
  const userId = req.session.userId;
  if (userId) {
    tokenStore.delete(userId);
  }
  req.session.destroy();
  res.redirect('/');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Google OAuth v3 Demo Project`);
  console.log(`🔐 Make sure to set up your .env file with Google OAuth credentials`);
}); 