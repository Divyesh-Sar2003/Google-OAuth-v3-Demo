# Google OAuth v3 Demo Project

A comprehensive demo project showcasing Google OAuth v3 integration with automatic token refresh functionality. This project demonstrates how to implement secure Google authentication and handle token expiration automatically.

## 🚀 Features

- **Google OAuth v3 Integration**: Modern OAuth 2.0 implementation using Google's latest APIs
- **Automatic Token Refresh**: Seamlessly refreshes expired access tokens using refresh tokens
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Real-time Token Monitoring**: Live display of token status and expiration times
- **Session Management**: Secure session handling with Express.js
- **Activity Logging**: Comprehensive logging of all authentication activities
- **Mobile Responsive**: Works perfectly on all device sizes

## 🛠️ Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Platform account
- Basic knowledge of OAuth 2.0 concepts

## 📋 Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install

# Or using yarn
yarn install
```

### 2. Google Cloud Platform Setup

#### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project

#### Step 2: Enable Required APIs
1. Navigate to "APIs & Services" > "Library"
2. Search for and enable these APIs:
   - Google+ API
   - Google OAuth2 API

#### Step 3: Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in required information:
   - App name: "Google OAuth v3 Demo"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`
5. Add test users (your email address)

#### Step 4: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
5. Copy the Client ID and Client Secret

### 3. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your credentials:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
   SESSION_SECRET=your_session_secret_here
   PORT=3000
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

3. **Generate a strong session secret** (recommended):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### 4. Run the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## 🔐 How It Works

### OAuth Flow
1. User clicks "Sign in with Google" button
2. Redirected to Google OAuth consent screen
3. User grants permissions
4. Google redirects back with authorization code
5. Server exchanges code for access and refresh tokens
6. User is redirected to dashboard

### Token Refresh
- Access tokens expire after 1 hour
- Refresh tokens are long-lived (until revoked)
- System automatically detects token expiration
- New access token is fetched using refresh token
- User experience remains seamless

### Security Features
- Secure session management
- HTTPS-only cookies in production
- Token storage in memory (configurable for production)
- Automatic token cleanup on logout

## 📱 Usage

### Login Page (`/`)
- Clean, modern interface
- Google OAuth button
- Setup instructions
- Feature highlights

### Dashboard (`/dashboard`)
- User profile information
- Token status and details
- Action buttons for testing
- Real-time activity logs

### API Endpoints
- `GET /auth/google` - Initiate OAuth flow
- `GET /auth/google/callback` - OAuth callback
- `GET /api/profile` - Get user profile (with auto-refresh)
- `GET /logout` - Logout and clear session

## 🏗️ Project Structure

```
├── server.js              # Main Express server
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (create from .env.example)
├── .env.example          # Environment variables template
├── public/               # Static files
│   ├── index.html        # Login page
│   ├── dashboard.html    # Dashboard page
│   ├── styles.css        # Main stylesheet
│   ├── script.js         # Login page script
│   └── dashboard.js      # Dashboard functionality
└── README.md             # This file
```

## 🔧 Configuration Options

### Environment Variables
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
- `GOOGLE_REDIRECT_URI`: OAuth callback URL
- `SESSION_SECRET`: Secret for session encryption
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

### Customization
- Modify scopes in `server.js` for different Google APIs
- Adjust token refresh timing in `dashboard.js`
- Customize UI colors and styles in `styles.css`
- Add additional Google API integrations

## 🔒 Security Features

This project implements several security measures:

- **Environment Variable Protection**: Sensitive data stored in `.env` files (never committed to Git)
- **Secure Session Management**: HTTP-only cookies with configurable secure flags
- **CORS Protection**: Restricted cross-origin requests to specified domains
- **Token Validation**: Automatic token expiration checking and refresh
- **Input Validation**: Proper handling of OAuth callback parameters
- **Secure Headers**: Express.js security middleware

## 🚨 Production Considerations

### Security
- Use HTTPS in production
- Store tokens in secure database (Redis, PostgreSQL)
- Implement proper session storage
- Add rate limiting
- Use environment-specific secrets
- **Never commit `.env` files to version control**
- Use strong, randomly generated session secrets
- Restrict CORS origins to trusted domains

### Performance
- Implement token caching
- Add monitoring and logging
- Use load balancers for high traffic
- Implement proper error handling

### Monitoring
- Add health check endpoints
- Implement logging (Winston, Bunyan)
- Add metrics collection
- Monitor token refresh success rates

## 🐛 Troubleshooting

### Common Issues

#### "Invalid redirect URI" Error
- Ensure redirect URI in Google Console matches exactly
- Check for trailing slashes or protocol differences
- Verify domain and port settings

#### "Access blocked" Error
- Check OAuth consent screen configuration
- Ensure test users are added
- Verify API enablement

#### Token Refresh Failures
- Check refresh token validity
- Verify client credentials
- Check network connectivity
- Review server logs for errors

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google APIs Node.js Client](https://github.com/googleapis/google-api-nodejs-client)
- [Express.js Documentation](https://expressjs.com/)
- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review Google Cloud Console logs
3. Check browser console for errors
4. Verify environment configuration
5. Create an issue in the repository

---

**Note**: This is a demo project intended for learning and development purposes. For production use, ensure you implement proper security measures and follow OAuth 2.0 best practices. 