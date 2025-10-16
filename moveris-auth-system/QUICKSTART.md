# Quick Start Guide

Get the Moveris Liveliness Authentication system running in 5 minutes.

## 📋 Prerequisites

- Node.js 16+ installed
- Google account (for OAuth setup)
- Moveris developer account
- Webcam-enabled device

## 🚀 Setup Steps

### 1. Install Dependencies (1 minute)

```bash
npm install
```

This installs:
- React & React DOM
- @react-oauth/google (Google authentication)
- lucide-react (UI icons)
- Tailwind CSS (styling)
- Vite (build tool)

### 2. Get Google OAuth Credentials (2 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project (or select existing)
3. Enable "Google+ API"
4. Navigate to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add to "Authorized JavaScript origins":
   ```
   http://localhost:5173
   ```
7. Copy your Client ID (looks like: `xxxxx.apps.googleusercontent.com`)

### 3. Get Moveris API Credentials (1 minute)

1. Sign up at [Moveris Developer Portal](https://developers.moveris.com)
2. Create a new application
3. Copy your:
   - WebSocket URI: `wss://developers.moveris.com/ws/live/v1/`
   - Authentication Token: `Bearer your_token_here`

### 4. Configure Application (1 minute)

Open `src/App.jsx` and update lines 24-27:

```javascript
const CONFIG = {
  GOOGLE_CLIENT_ID: "paste_your_google_client_id_here",
  MOVERIS_WS_URI: "wss://developers.moveris.com/ws/live/v1/",
  MOVERIS_AUTH_TOKEN: "Bearer paste_your_moveris_token_here",
  FRAME_CAPTURE_INTERVAL: 500,
  LIVELINESS_DURATION: 5000,
};
```

### 5. Run Development Server

```bash
npm run dev
```

Open browser to `http://localhost:5173`

## ✅ Testing the Flow

1. **Click "Continue with Google"** button
2. **Sign in** with your Google account
3. **Allow webcam access** when prompted
4. **Look at the camera** for 5 seconds
5. **Success!** You should see a success message

## 🎯 What Should Happen

```
Step 1: Login Screen
├─ Shows Google Sign In button
└─ Info about 2FA liveliness check

Step 2: Google Authentication
├─ Redirects to Google
├─ User signs in
└─ Returns to app with user info

Step 3: Liveliness Check
├─ Requests webcam access
├─ Connects to Moveris WebSocket
├─ Sends authentication token
├─ Captures video frames (every 500ms)
├─ Sends frames to Moveris API
└─ Receives liveliness result

Step 4: Success/Failure
├─ Success: Shows user profile and success message
└─ Failure: Shows error with retry option
```

## 🐛 Troubleshooting

### "Failed to access webcam"
- **Cause**: Browser doesn't have camera permission
- **Fix**: Click lock icon in address bar → Allow camera

### "Google login failed"
- **Cause**: Incorrect Client ID or unauthorized origin
- **Fix**: Double-check Client ID and add `http://localhost:5173` to authorized origins

### "Connection error" or WebSocket fails
- **Cause**: Incorrect Moveris credentials or network issue
- **Fix**: Verify token format includes "Bearer " prefix

### Black video screen
- **Cause**: Camera in use by another app
- **Fix**: Close other apps using camera (Zoom, Teams, etc.)

### Nothing happens after Google login
- **Cause**: Browser blocked WebSocket or webcam
- **Fix**: Check browser console (F12) for error messages

## 📱 Testing on Mobile

1. Find your local IP address:
   ```bash
   # On Mac/Linux
   ifconfig | grep inet
   
   # On Windows
   ipconfig
   ```

2. Update Google OAuth authorized origins:
   ```
   http://YOUR_IP:5173
   ```

3. On mobile browser, navigate to:
   ```
   http://YOUR_IP:5173
   ```

## 🔧 Customization Quick Tips

### Change Theme Colors
Find and replace in `src/App.jsx`:
- `indigo` → your color (e.g., `blue`, `green`, `purple`)

### Adjust Detection Time
In `CONFIG` object:
```javascript
LIVELINESS_DURATION: 3000,  // 3 seconds instead of 5
```

### Change Frame Rate
In `CONFIG` object:
```javascript
FRAME_CAPTURE_INTERVAL: 1000,  // 1 frame/second instead of 2 frames/second
```

### Modify Video Quality
In `initializeWebcam()` function, change:
```javascript
video: { 
  width: { ideal: 1280 },  // Higher resolution
  height: { ideal: 720 },
  facingMode: 'user'
}
```

## 📚 Next Steps

- Read [README.md](./README.md) for comprehensive documentation
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Check component code comments for detailed explanations
- Explore Moveris API documentation for advanced features

## 💡 Common Modifications

### Add User Session Persistence

```javascript
// Save user after successful auth
localStorage.setItem('user', JSON.stringify(googleUser));

// Load user on app start
useEffect(() => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    setGoogleUser(JSON.parse(savedUser));
    setAuthStage('success');
  }
}, []);
```

### Add Logout Functionality

```javascript
const handleLogout = () => {
  localStorage.removeItem('user');
  setGoogleUser(null);
  setAuthStage('login');
};
```

### Add Loading States

```javascript
const [isLoading, setIsLoading] = useState(false);

// Show spinner during operations
{isLoading && <Loader2 className="animate-spin" />}
```

## 🎓 Understanding the Code

### Key Files
- `src/App.jsx` - Main application logic
- `src/main.jsx` - React entry point
- `src/index.css` - Tailwind CSS imports
- `index.html` - HTML template

### Important Functions
- `handleGoogleSuccess()` - Processes Google login
- `initializeWebcam()` - Starts camera
- `initializeWebSocket()` - Connects to Moveris
- `captureFrame()` - Takes video snapshots
- `startFrameCapture()` - Sends frames to API

### State Variables
- `authStage` - Current step (login/liveliness/success/error)
- `googleUser` - User info from Google
- `frameCount` - Number of frames sent
- `detectionResult` - Moveris API response

## 🆘 Getting Help

### Check Logs
Open browser console (F12) to see:
- WebSocket connection status
- Frame transmission logs
- Error messages

### Common Console Messages
```
✓ "Connected to Moveris WebSocket" - Good
✓ "Sent authentication payload" - Good
✓ "Sent frame: 1" - Good
✗ "WebSocket error" - Check Moveris credentials
✗ "Failed to access webcam" - Check permissions
```

### Still Stuck?
1. Check all credentials are correct
2. Verify webcam works in other apps
3. Try different browser
4. Check firewall/antivirus settings
5. Review error messages in console

## 🎉 Success Checklist

- [x] Dependencies installed
- [x] Google OAuth configured
- [x] Moveris credentials added
- [x] Development server running
- [x] Can see login page
- [x] Google login works
- [x] Webcam activates
- [x] Frames are being sent
- [x] Liveliness detected successfully

**You're ready to build!** 🚀

---

**Estimated Total Time**: 5-10 minutes

For detailed documentation, see [README.md](./README.md)

