# Quick Start Guide

Get the Moveris Liveliness Authentication system running in 5 minutes.

## 📋 Prerequisites

- Node.js 16+ installed
- Moveris developer account with secret key
- Webcam-enabled device

## 🚀 Setup Steps

### 1. Install Dependencies (1 minute)

```bash
npm install
```

This installs:
- React & React DOM
- lucide-react (UI icons)
- Tailwind CSS (styling)
- Vite (build tool)

### 2. Get Moveris API Credentials (2 minutes)

1. Sign up at [Moveris Developer Portal](https://developers.moveris.com)
2. Create a new application
3. Copy your:
   - WebSocket URI: `wss://dev.api.moveris.com/ws/live/v1/`
   - Secret Key: `your_secret_key_here`

### 3. Configure Application (1 minute)

**Option A: Using Environment Variables (Recommended)**

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and update with your credentials:
```env
VITE_MOVERIS_WS_URI=wss://dev.api.moveris.com/ws/live/v1/
VITE_MOVERIS_SECRET_KEY=paste_your_secret_key_here
VITE_FRAME_RATE=10
VITE_IMAGE_QUALITY=0.7
VITE_REQUIRED_FRAMES=500
VITE_ADMIN_EMAIL=admin@example.com
VITE_ADMIN_PASSWORD=Admin@123
```

**Option B: Direct Code Configuration**

Open `src/App.jsx` and update the CONFIG object (lines 22-30):
```javascript
const CONFIG = {
  MOVERIS_WS_URI: "wss://dev.api.moveris.com/ws/live/v1/",
  MOVERIS_SECRET_KEY: "paste_your_secret_key_here",
  FRAME_RATE: 10,
  IMAGE_QUALITY: 0.7,
  REQUIRED_FRAMES: 500,
  ADMIN_EMAIL: "admin@example.com",
  ADMIN_PASSWORD: "Admin@123",
};
```

**Note:** Environment variables (Option A) are recommended as they keep credentials out of your code.

### 4. Run Development Server

```bash
npm run dev
```

Open browser to `http://localhost:5173`

## ✅ Testing the Flow

1. **Enter login credentials**
   - Email: admin@example.com
   - Password: Admin@123
2. **Click "Sign In"** button
3. **Allow webcam access** when prompted
4. **Look at the camera** while 500 frames are captured
5. **Wait for processing** (takes about 50 seconds at 10 FPS)
6. **Success!** You should see verification results

## 🎯 What Should Happen

```
Step 1: Login Screen
├─ Shows email/password form
├─ Enter: admin@example.com / Admin@123
└─ Info about 2FA liveliness check

Step 2: Email/Password Authentication
├─ Validates credentials
└─ Proceeds to webcam stage

Step 3: Liveliness Check
├─ Requests webcam access
├─ Connects to Moveris WebSocket
├─ Sends secret key for authentication
├─ Captures video frames at 10 FPS
├─ Sends 500 frames to Moveris API
├─ Shows real-time stats (frames sent, ack'd, time)
└─ Receives liveliness result

Step 4: Success/Failure
├─ Success: Shows detection results and user profile
└─ Failure: Shows error with retry option
```

## 🐛 Troubleshooting

### "Failed to access webcam"
- **Cause**: Browser doesn't have camera permission
- **Fix**: Click lock icon in address bar → Allow camera

### "Invalid email or password"
- **Cause**: Incorrect credentials entered
- **Fix**: Use admin@example.com / Admin@123 or update CONFIG in App.jsx

### "Connection error" or WebSocket fails
- **Cause**: Incorrect Moveris secret key or network issue
- **Fix**: Verify secret key is correct (no "Bearer" prefix needed)

### Black video screen
- **Cause**: Camera in use by another app
- **Fix**: Close other apps using camera (Zoom, Teams, etc.)

### Nothing happens after login
- **Cause**: WebSocket connection or authentication failed
- **Fix**: Check browser console (F12) for error messages and verify secret key

### Frames not processing
- **Cause**: Not enough frames sent or connection dropped
- **Fix**: Wait for all 500 frames to be sent. Check "Frames Sent" counter

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