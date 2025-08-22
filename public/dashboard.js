// Dashboard functionality for Google OAuth v3 Demo
let profileData = null;
let refreshInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Google OAuth v3 Dashboard loaded');
    loadProfile();
    
    // Set up automatic profile refresh every 5 minutes
    refreshInterval = setInterval(loadProfile, 5 * 60 * 1000);
    
    // Add log entry
    addLogEntry('Dashboard loaded successfully');
});

async function loadProfile() {
    try {
        addLogEntry('Loading user profile...');
        
        const response = await fetch('/api/profile');
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid, redirect to login
                addLogEntry('Authentication failed, redirecting to login');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        profileData = data;
        
        updateProfileDisplay(data.user);
        updateTokenDisplay(data.tokens);
        updateTokenStatus(data.tokens.expires_in);
        
        addLogEntry('Profile loaded successfully');
        
    } catch (error) {
        console.error('Error loading profile:', error);
        addLogEntry(`Error loading profile: ${error.message}`);
        
        // Check if it's an authentication error
        if (error.message.includes('401') || error.message.includes('Not authenticated')) {
            addLogEntry('Authentication failed, redirecting to login');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }
    }
}

function updateProfileDisplay(user) {
    document.getElementById('userName').textContent = user.name || 'N/A';
    document.getElementById('userEmail').textContent = user.email || 'N/A';
    document.getElementById('userId').textContent = user.id || 'N/A';
    document.getElementById('userLocale').textContent = user.locale || 'N/A';
    document.getElementById('userVerified').textContent = user.verified_email ? 'Yes' : 'No';
    
    // Update profile avatar if picture is available
    if (user.picture) {
        const avatar = document.querySelector('.profile-avatar');
        avatar.innerHTML = `<img src="${user.picture}" alt="Profile Picture" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    }
}

function updateTokenDisplay(tokens) {
    // Mask access token for security - only show first 8 and last 4 characters
    const maskedToken = tokens.access_token ? 
        `${tokens.access_token.substring(0, 8)}...${tokens.access_token.substring(tokens.access_token.length - 4)}` : 
        'N/A';
    document.getElementById('accessToken').textContent = maskedToken;
    document.getElementById('tokenExpiresIn').textContent = formatExpiryTime(tokens.expires_in);
    document.getElementById('tokenScopes').textContent = tokens.scope || 'N/A';
}

function updateTokenStatus(expiresIn) {
    const statusElement = document.getElementById('tokenStatus');
    const icon = statusElement.querySelector('i');
    const text = statusElement.querySelector('span');
    
    if (expiresIn > 300) { // More than 5 minutes
        statusElement.className = 'status-indicator valid';
        icon.className = 'fas fa-check-circle';
        text.textContent = `Token valid (expires in ${formatExpiryTime(expiresIn)})`;
    } else if (expiresIn > 0) {
        statusElement.className = 'status-indicator refreshing';
        icon.className = 'fas fa-sync-alt';
        text.textContent = `Token expiring soon (${formatExpiryTime(expiresIn)}) - will refresh automatically`;
    } else {
        statusElement.className = 'status-indicator expired';
        icon.className = 'fas fa-exclamation-triangle';
        text.textContent = 'Token expired - refreshing...';
        
        // Trigger refresh
        setTimeout(loadProfile, 1000);
    }
}

function formatExpiryTime(seconds) {
    if (seconds < 60) {
        return `${seconds} seconds`;
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
}

function refreshProfile() {
    addLogEntry('Manual profile refresh requested');
    loadProfile();
}

function checkTokenStatus() {
    if (profileData && profileData.tokens) {
        addLogEntry('Token status checked manually');
        updateTokenStatus(profileData.tokens.expires_in);
    } else {
        addLogEntry('No token data available');
    }
}

function showTokenInfo() {
    if (profileData && profileData.tokens) {
        // Mask access token for security
        const maskedToken = profileData.tokens.access_token ? 
            `${profileData.tokens.access_token.substring(0, 8)}...${profileData.tokens.access_token.substring(profileData.tokens.access_token.length - 4)}` : 
            'N/A';
        
        const info = `
Token Information:
- Access Token: ${maskedToken}
- Expires In: ${formatExpiryTime(profileData.tokens.expires_in)}
- Scopes: ${profileData.tokens.scope}
- Last Updated: ${new Date().toLocaleString()}
        `;
        
        alert(info);
        addLogEntry('Token information displayed (masked)');
    } else {
        alert('No token information available');
        addLogEntry('No token information to display');
    }
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    if (text === 'Loading...' || text === 'N/A') {
        alert('No content to copy');
        return;
    }
    
    // Security: Prevent copying full access tokens
    if (elementId === 'accessToken' && profileData && profileData.tokens && profileData.tokens.access_token) {
        alert('Access token copying is disabled for security reasons');
        addLogEntry('Access token copy attempt blocked for security');
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        addLogEntry(`Copied ${elementId} to clipboard`);
        
        // Show success feedback
        const originalText = element.textContent;
        element.textContent = 'Copied!';
        element.style.color = '#28a745';
        
        setTimeout(() => {
            element.textContent = originalText;
            element.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        addLogEntry('Failed to copy to clipboard');
    });
}

function addLogEntry(message) {
    const logsContainer = document.getElementById('logsContainer');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    
    const timestamp = new Date().toLocaleTimeString();
    logEntry.innerHTML = `
        <span class="timestamp">${timestamp}</span>
        <span class="message">${message}</span>
    `;
    
    logsContainer.appendChild(logEntry);
    
    // Keep only last 10 log entries
    while (logsContainer.children.length > 10) {
        logsContainer.removeChild(logsContainer.firstChild);
    }
    
    // Auto-scroll to bottom
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

// Clean up interval when page is unloaded
window.addEventListener('beforeunload', function() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});

// Handle visibility change to pause/resume refresh when tab is not active
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            addLogEntry('Auto-refresh paused (tab inactive)');
        }
    } else {
        if (!refreshInterval) {
            refreshInterval = setInterval(loadProfile, 5 * 60 * 1000);
            addLogEntry('Auto-refresh resumed (tab active)');
        }
    }
}); 