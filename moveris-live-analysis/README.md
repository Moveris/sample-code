# Moveris Liveliness Authentication System

A production-ready React authentication system that combines email/password login with real-time liveliness detection using Moveris Live API. This provides a secure two-factor authentication where the second factor is biometric liveliness verification through live video stream analysis.

## 🎯 Features

- **Email/Password Authentication** - Simple login system (extensible to backend API)
- **Real-time Liveliness Detection** - WebSocket-based live person verification using Moveris Live API
- **500-Frame Analysis** - Comprehensive biometric verification through continuous video stream
- **Live Statistics Dashboard** - Real-time display of frames sent, acknowledged, connection time, and processing status
- **Configurable Frame Rate** - Adjust capture rate (1-60 FPS) and image quality
- **Modern UI/UX** - Built with Tailwind CSS and Lucide React icons
- **Well-Documented Code** - Comprehensive comments and clear structure
- **Error Handling** - Robust error management with detailed user feedback
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Progress Tracking** - Visual feedback showing verification progress

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- Moveris API credentials (Secret Key)
- Modern browser with webcam support
- HTTPS connection (required for webcam access in production)

### Installation

1. **Clone or download this repository**

```bash
git clone <your-repo-url>
cd moveris-live-analysis
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure credentials**

Open `src/App.jsx` and update the `CONFIG` object (lines 22-30):

```javascript
const CONFIG = {
  MOVERIS_WS_URI: "wss://dev.api.moveris.com/ws/live/v1/",
  MOVERIS_SECRET_KEY: "your_moveris_secret_key_here",
  FRAME_RATE: 10,              // Frames per second (1-60)
  IMAGE_QUALITY: 0.7,          // JPEG quality (0.1-1.0)
  REQUIRED_FRAMES: 500,        // Total frames for analysis
  // Demo login credentials (replace with backend auth in production)
  ADMIN_EMAIL: "admin@example.com",
  ADMIN_PASSWORD: "Admin@123",
};
```

4. **Start development server**

```bash
npm run dev
```

5. **Open your browser**

Navigate to `http://localhost:5173` (or the port shown in terminal)

6. **Test the system**

- Login with: `admin@example.com` / `Admin@123`
- Allow webcam access when prompted
- Look at camera while system captures 500 frames
- View verification results

## 🔧 Configuration Guide

### Moveris API Setup

1. **Sign up** at [Moveris Developer Portal](https://developers.moveris.com)
2. **Create a new application**
3. **Copy your credentials:**
   - WebSocket URI: `wss://dev.api.moveris.com/ws/live/v1/`
   - Secret Key: Your unique secret key (no "Bearer" prefix needed)
4. **Update configuration** in `src/App.jsx`

### Authentication Configuration

#### Demo Credentials (Development)
The application includes hardcoded credentials for testing:
```javascript
ADMIN_EMAIL: "admin@example.com",
ADMIN_PASSWORD: "Admin@123",
```

#### Production Setup
**⚠️ IMPORTANT:** Never use hardcoded credentials in production!

**Recommended Production Architecture:**

```
Frontend (React)           Backend API              Moveris API
    │                          │                         │
    ├─── Login Request ───────>│                         │
    │    (email/password)       │                         │
    │                           │                         │
    │<── JWT Token ─────────────┤                         │
    │                           │                         │
    │                           │                         │
    ├─── WebSocket Connect ────>│                         │
    │    (with JWT)             │                         │
    │                           ├─── Authenticate ───────>│
    │                           │    (secret key)         │
    │                           │                         │
    │                           │<── Auth Success ────────┤
    │                           │                         │
    ├─── Send Frames ──────────>│                         │
    │                           ├─── Forward Frames ─────>│
    │                           │                         │
    │<── Results ───────────────┤<── Analysis Results ────┤
```

**Backend Implementation Steps:**

1. Create REST API for login validation
2. Implement JWT or session-based authentication
3. Create WebSocket proxy endpoint
4. Store Moveris secret key on backend
5. Validate user authentication before proxying to Moveris

### Frame Capture Settings

Adjust performance and quality parameters:

```javascript
const CONFIG = {
  // Frame rate: Higher = faster processing but more bandwidth
  FRAME_RATE: 10,        // Options: 1-60 FPS (recommended: 10-15)
  
  // Image quality: Higher = better accuracy but larger files
  IMAGE_QUALITY: 0.7,    // Options: 0.1-1.0 (recommended: 0.6-0.8)
  
  // Required frames: More = better accuracy but longer wait
  REQUIRED_FRAMES: 500,  // Default: 500 (takes ~50s at 10 FPS)
};
```

**Performance Guidelines:**
- **Fast verification:** 10 FPS, 0.6 quality, 500 frames = ~50 seconds
- **Balanced:** 15 FPS, 0.7 quality, 500 frames = ~33 seconds
- **High quality:** 10 FPS, 0.9 quality, 500 frames = ~50 seconds
- **Network-limited:** 5 FPS, 0.5 quality, 500 frames = ~100 seconds

### Webcam Settings

Customize video capture constraints:

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: { 
    width: { ideal: 640 },      // Resolution width
    height: { ideal: 480 },     // Resolution height
    frameRate: { ideal: 10 },   // Match FRAME_RATE config
    facingMode: 'user'          // Front camera
  },
  audio: false
});
```

**Resolution Options:**
- **Standard:** 640x480 (VGA) - Good balance
- **HD:** 1280x720 (720p) - Better quality, more bandwidth
- **Low:** 320x240 (QVGA) - Low bandwidth environments

## 📋 Authentication Flow

### Complete User Journey

```
┌─────────────────────────────────────────────────────────┐
│  1. User Opens Application                              │
│     ├─ Sees login form                                  │
│     └─ Enters email & password                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  2. Credential Validation                               │
│     ├─ Frontend validates format                        │
│     ├─ Compares with configured credentials             │
│     └─ [Production: Backend API validates against DB]   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  3. Webcam Initialization                               │
│     ├─ Request camera permissions                       │
│     ├─ Initialize video stream                          │
│     └─ Display video preview to user                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  4. WebSocket Connection                                │
│     ├─ Connect to: wss://dev.api.moveris.com/ws/...    │
│     ├─ Server sends: {"type":"auth_required"}          │
│     └─ Start connection timer                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  5. Moveris Authentication                              │
│     ├─ Send: {"type":"auth","token":"secret_key"}      │
│     ├─ Server validates secret key                      │
│     └─ Receive: {"type":"auth_success"}                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  6. Frame Capture & Transmission (Continuous Loop)      │
│     ├─ Capture frame from webcam every 1/FPS seconds    │
│     ├─ Convert to JPEG with configured quality          │
│     ├─ Encode to base64                                 │
│     ├─ Send: {"type":"frame","frame_number":N,...}     │
│     ├─ Receive: {"type":"frame_received",...}          │
│     ├─ Update UI with progress (N/500 frames)          │
│     └─ Repeat until 500 frames sent                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  7. Server Processing                                   │
│     ├─ Receive: {"type":"processing_started"}          │
│     ├─ Moveris analyzes all 500 frames                  │
│     ├─ Performs liveliness detection                    │
│     ├─ Calculates confidence scores                     │
│     └─ Generates detailed results                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  8. Results & Decision                                  │
│     ├─ Receive: {"type":"processing_complete",...}     │
│     ├─ Extract: prediction, confidence, AI metrics      │
│     ├─ If prediction === "live":                        │
│     │   ├─ Show success message                         │
│     │   ├─ Display detection results                    │
│     │   └─ Grant access to application                  │
│     └─ Else:                                            │
│         ├─ Show failure message                         │
│         └─ Offer retry option                           │
└─────────────────────────────────────────────────────────┘
```

### Detailed Message Flow

#### 1. Connection & Authentication
```javascript
// Client connects
ws = new WebSocket("wss://dev.api.moveris.com/ws/live/v1/");

// Server responds
← {"type": "auth_required"}

// Client authenticates
→ {"type": "auth", "token": "your_secret_key"}

// Server confirms
← {"type": "auth_success"}
```

#### 2. Frame Streaming
```javascript
// Client sends frames (repeat 500 times)
→ {
    "type": "frame",
    "frame_number": 1,
    "frame_data": "base64_encoded_jpeg...",
    "timestamp": 1234567890.123
  }

// Server acknowledges each frame
← {
    "type": "frame_received",
    "frame_number": 1,
    "total_frames": 100  // Running count
  }
```

#### 3. Processing & Results
```javascript
// Server starts processing
← {"type": "processing_started"}

// Server returns final results
← {
    "type": "processing_complete",
    "result": {
      "prediction": "live",           // "live" or "not_live"
      "ai_probability": 0.95,         // 0.0 - 1.0
      "confidence": 0.98,             // 0.0 - 1.0
      "processing_time_seconds": 45.2,
      "ai_attention_level": "high",   // high/medium/low
      "ai_emotion_level": "neutral",  // neutral/happy/etc
      "result": "success"
    }
  }
```

#### 4. Error Handling
```javascript
// Server error
← {
    "type": "error",
    "message": "Insufficient frames or quality issue"
  }
```

## 🏗️ Project Structure

```
moveris-live-analysis/
├── src/
│   ├── App.jsx              # Main application component
│   │   ├── CONFIG           # Configuration constants
│   │   ├── State Management # React hooks for app state
│   │   ├── Login Handler    # Email/password validation
│   │   ├── Webcam Manager   # Camera initialization & capture
│   │   ├── WebSocket Client # Moveris API communication
│   │   └── UI Components    # Login, liveliness, success screens
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles with Tailwind
├── public/
│   └── index.html           # HTML template
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite build configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── .gitignore               # Git ignore rules
├── .env.example             # Environment variables template
├── README.md                # This file
├── QUICKSTART.md            # Quick setup guide
└── DEPLOYMENT.md            # Production deployment guide
```

## 🔌 API Integration

### Moveris WebSocket Protocol

#### Connection Setup
```javascript
const ws = new WebSocket("wss://dev.api.moveris.com/ws/live/v1/");

ws.onopen = () => {
  console.log('Connected to Moveris');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleMessage(data);
};
```

#### Message Types Reference

| Message Type | Direction | Description |
|-------------|-----------|-------------|
| `auth_required` | Server → Client | Server requests authentication |
| `auth` | Client → Server | Client sends secret key |
| `auth_success` | Server → Client | Authentication successful |
| `frame` | Client → Server | Video frame data |
| `frame_received` | Server → Client | Frame acknowledgment |
| `processing_started` | Server → Client | Analysis has begun |
| `processing_complete` | Server → Client | Analysis complete with results |
| `error` | Server → Client | Error occurred |

#### Complete Integration Example

```javascript
class MoverisClient {
  constructor(secretKey) {
    this.ws = new WebSocket('wss://dev.api.moveris.com/ws/live/v1/');
    this.secretKey = secretKey;
    this.frameCount = 0;
    
    this.ws.onopen = () => this.handleOpen();
    this.ws.onmessage = (e) => this.handleMessage(JSON.parse(e.data));
  }
  
  handleOpen() {
    console.log('Connected, waiting for auth request...');
  }
  
  handleMessage(data) {
    switch(data.type) {
      case 'auth_required':
        this.authenticate();
        break;
      case 'auth_success':
        this.startStreaming();
        break;
      case 'frame_received':
        console.log(`Frame ${data.frame_number} acknowledged`);
        break;
      case 'processing_complete':
        this.handleResults(data.result);
        break;
      case 'error':
        console.error('Error:', data.message);
        break;
    }
  }
  
  authenticate() {
    this.ws.send(JSON.stringify({
      type: 'auth',
      token: this.secretKey
    }));
  }
  
  sendFrame(frameData) {
    this.frameCount++;
    this.ws.send(JSON.stringify({
      type: 'frame',
      frame_number: this.frameCount,
      frame_data: frameData,
      timestamp: Date.now() / 1000
    }));
  }
  
  handleResults(result) {
    console.log('Liveliness Result:', result);
    if (result.prediction === 'live') {
      console.log('✓ Live person detected!');
      console.log(`Confidence: ${(result.confidence * 100).toFixed(2)}%`);
    }
  }
}
```

## 🎨 Customization

### Change Theme Colors

The application uses Tailwind CSS. To change the primary color:

```javascript
// In App.jsx, find and replace:
"bg-indigo-600"  →  "bg-blue-600"    // Different color
"text-indigo-600" →  "text-blue-600"
"border-indigo-500" → "border-blue-500"

// Available colors: blue, green, purple, pink, red, yellow, etc.
```

### Modify Frame Requirements

```javascript
// Fewer frames (faster but less accurate)
REQUIRED_FRAMES: 250,  // ~25 seconds at 10 FPS

// More frames (slower but more accurate)
REQUIRED_FRAMES: 1000, // ~100 seconds at 10 FPS
```

### Adjust Video Preview Size

```javascript
// In the video element className:
className="w-full h-64"  // Current: 256px height

// Options:
className="w-full h-48"  // Smaller: 192px
className="w-full h-80"  // Larger: 320px
className="w-full h-96"  // Extra large: 384px
```

### Add Custom Validation Rules

```javascript
const handleLogin = (e) => {
  e.preventDefault();
  
  // Add custom validation
  if (!email.includes('@')) {
    setError('Invalid email format');
    return;
  }
  
  if (password.length < 8) {
    setError('Password must be at least 8 characters');
    return;
  }
  
  // Your validation logic here
  if (validateCredentials(email, password)) {
    proceedToLiveliness();
  }
};
```

## 🔒 Security Considerations

### Critical Security Rules

1. **Never Commit Credentials**
   - Use environment variables
   - Add `.env` to `.gitignore`
   - Never hardcode secret keys in code

2. **HTTPS Required**
   - Webcam access requires HTTPS in production
   - Use valid SSL certificates
   - Configure proper security headers

3. **Backend Authentication Required**
   - Never validate passwords in frontend
   - Use backend API for credential validation
   - Implement proper session management

4. **Secret Key Protection**
   - Store Moveris secret key on backend only
   - Never expose in frontend code
   - Use environment variables on server

5. **Rate Limiting**
   - Implement on backend to prevent abuse
   - Limit login attempts
   - Throttle WebSocket connections

6. **Input Validation**
   - Sanitize all user inputs
   - Validate on both frontend and backend
   - Protect against injection attacks

7. **Session Management**
   - Use secure JWT tokens or sessions
   - Implement proper expiration
   - Use httpOnly cookies when possible

### Production Security Checklist

- [ ] Move authentication to backend API
- [ ] Store secret keys in environment variables
- [ ] Implement rate limiting on login endpoint
- [ ] Use HTTPS with valid SSL certificate
- [ ] Add CORS headers properly configured
- [ ] Implement session timeout
- [ ] Add logging for security events
- [ ] Set up monitoring and alerts
- [ ] Regular security audits
- [ ] Keep dependencies updated

## 🌐 Deployment

### Environment Variables

Create `.env` file for production:

```env
# Moveris Configuration
VITE_MOVERIS_WS_URI=wss://dev.api.moveris.com/ws/live/v1/
VITE_MOVERIS_SECRET_KEY=your_production_secret_key

# Frame Settings
VITE_FRAME_RATE=10
VITE_IMAGE_QUALITY=0.7
VITE_REQUIRED_FRAMES=500

# DO NOT include login credentials in .env
# Use backend API for authentication
```

Update config to use environment variables:

```javascript
const CONFIG = {
  MOVERIS_WS_URI: import.meta.env.VITE_MOVERIS_WS_URI || "wss://dev.api.moveris.com/ws/live/v1/",
  MOVERIS_SECRET_KEY: import.meta.env.VITE_MOVERIS_SECRET_KEY || "",
  FRAME_RATE: parseInt(import.meta.env.VITE_FRAME_RATE) || 10,
  IMAGE_QUALITY: parseFloat(import.meta.env.VITE_IMAGE_QUALITY) || 0.7,
  REQUIRED_FRAMES: parseInt(import.meta.env.VITE_REQUIRED_FRAMES) || 500,
};
```

### Build for Production

```bash
# Install dependencies
npm install

# Build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

### Production Backend Example

**Important:** In production, implement a backend proxy:

```javascript
// backend/server.js (Node.js/Express example)
const express = require('express');
const expressWs = require('express-ws');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
expressWs(app);

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Validate against database
    const user = await db.findUserByEmail(email);
    
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ success: true, token, user: { email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// WebSocket proxy endpoint
app.ws('/api/liveliness', verifyJWT, (ws, req) => {
  const userId = req.user.userId;
  
  // Connect to Moveris with server-side secret
  const moverisWs = new WebSocket('wss://dev.api.moveris.com/ws/live/v1/');
  
  moverisWs.on('open', () => {
    console.log(`User ${userId} connected to Moveris`);
  });
  
  moverisWs.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    
    if (msg.type === 'auth_required') {
      // Authenticate with server-side secret key
      moverisWs.send(JSON.stringify({
        type: 'auth',
        token: process.env.MOVERIS_SECRET_KEY
      }));
    } else {
      // Forward Moveris responses to client
      ws.send(data.toString());
    }
  });
  
  // Forward client frames to Moveris
  ws.on('message', (data) => {
    if (moverisWs.readyState === WebSocket.OPEN) {
      moverisWs.send(data.toString());
    }
  });
  
  // Handle disconnections
  ws.on('close', () => {
    moverisWs.close();
  });
  
  moverisWs.on('close', () => {
    ws.close();
  });
});

// JWT verification middleware
function verifyJWT(ws, req, next) {
  const token = req.query.token;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    ws.close(1008, 'Unauthorized');
  }
}

app.listen(3000, () => {
  console.log('Backend running on port 3000');
});
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Login Issues

**Problem:** "Invalid email or password"
- **Solution:** Verify you're using `admin@example.com` / `Admin@123` or update CONFIG
- **Check:** Email format is valid and password is correct

**Problem:** Login button not responding
- **Solution:** Check browser console for JavaScript errors
- **Check:** Ensure both email and password fields are filled

#### Webcam Issues

**Problem:** "Failed to access webcam"
- **Solution:** Grant camera permissions in browser
- **Check:** Click lock icon in address bar → Site settings → Camera → Allow
- **Check:** Verify no other application is using the camera
- **Check:** Using HTTPS (required in production)

**Problem:** Black video screen
- **Solution:** Camera in use by another application (Zoom, Teams, etc.)
- **Check:** Close other applications using camera
- **Check:** Try different browser

**Problem:** Video choppy or freezing
- **Solution:** Lower frame rate or image quality
- **Check:** Reduce FRAME_RATE to 5-8 FPS
- **Check:** Reduce IMAGE_QUALITY to 0.5-0.6

#### WebSocket Issues

**Problem:** "Connection error" or cannot connect
- **Solution:** Verify Moveris secret key is correct
- **Check:** No "Bearer" prefix in secret key
- **Check:** Network allows WebSocket connections (check firewall)
- **Check:** Using correct WebSocket URL: `wss://dev.api.moveris.com/ws/live/v1/`

**Problem:** "Connection closed unexpectedly"
- **Solution:** Check network stability
- **Check:** Verify secret key hasn't expired
- **Check:** Check Moveris API status

**Problem:** Frames not being acknowledged
- **Solution:** Check WebSocket connection is open
- **Check:** Verify authentication succeeded
- **Check:** Check browser console for transmission errors

#### Processing Issues

**Problem:** Stuck at "Processing frames..."
- **Solution:** Wait for all 500 frames to be sent
- **Check:** Monitor "Frames Sent" counter
- **Check:** Ensure good lighting on face
- **Check:** Keep face visible in camera frame

**Problem:** "Liveliness check failed"
- **Solution:** Improve lighting conditions
- **Check:** Face clearly visible and well-lit
- **Check:** Remove obstructions (glasses, mask if required)
- **Check:** Look directly at camera
- **Try:** Retry with better conditions

**Problem:** Very slow processing
- **Solution:** Adjust frame rate and quality
- **Check:** Lower FRAME_RATE for slower networks
- **Check:** Reduce IMAGE_QUALITY for faster transmission
- **Try:** 5 FPS, 0.5 quality for slow connections

#### Browser Compatibility

**Problem:** Features not working in browser
- **Solution:** Use modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Check:** WebRTC support: `navigator.mediaDevices` available
- **Check:** WebSocket support: `WebSocket` available
- **Check:** Enable JavaScript

### Debug Mode

Enable detailed logging:

```javascript
// Add to App.jsx CONFIG
DEBUG: true,

// Then in code:
if (CONFIG.DEBUG) {
  console.log('Debug info:', data);
}
```

### Console Commands

Open browser console (F12) and check for:

```javascript
// Check webcam access
navigator.mediaDevices.getUserMedia({video: true})
  .then(stream => console.log('Camera OK'))
  .catch(err => console.error('Camera Error:', err));

// Check WebSocket support
console.log('WebSocket supported:', typeof WebSocket !== 'undefined');

// View current configuration
// (Add this function to App.jsx for debugging)
window.showConfig = () => console.log(CONFIG);
```

## 📚 Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "vite": "^5.4.10"
  }
}
```

### Why These Dependencies?

- **React**: Modern UI library for building interactive interfaces
- **Lucide React**: Beautiful, consistent icon set
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Vite**: Fast build tool and development server
- **No external auth libraries**: Simple, self-contained authentication

## 🤝 Contributing

This is a reference implementation for developers. Contributions welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🆘 Support

### Documentation Resources
- **Moveris API Docs**: https://developers.moveris.com/docs
- **Moveris Support**: Contact your account manager
- **React Documentation**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vite Documentation**: https://vitejs.dev

### Getting Help

1. Check this README thoroughly
2. Review browser console for errors
3. Check QUICKSTART.md for setup issues
4. Check DEPLOYMENT.md for production issues
5. Contact Moveris support for API-specific questions

## 💡 Example Use Cases

### Real-World Applications

- **Banking & Financial Services**
  - Enhanced login security with live person verification
  - Transaction authorization for high-value transfers
  - Account recovery with identity verification

- **Healthcare & Telemedicine**
  - Patient identity verification before appointments
  - Prescription authorization
  - Medical record access control

- **Government & Public Services**
  - Citizen authentication for online services
  - Benefit claims verification
  - Digital document signing

- **Corporate & Enterprise**
  - Employee access control for sensitive systems
  - Remote work authentication
  - Time & attendance verification

- **Education & Testing**
  - Student identity verification during online exams
  - Proctoring for remote assessments
  - Course enrollment verification

- **E-Commerce & Marketplaces**
  - High-value purchase verification
  - Account recovery
  - Seller identity verification

- **Age Verification**
  - Confirm real person for age-restricted content
  - Gambling and gaming platforms
  - Adult content access control

- **KYC (Know Your Customer)**
  - Remote identity verification for account opening
  - Customer onboarding
  - Compliance verification

## 📝 License

MIT License - feel free to use in your projects

## 🎓 Learning Resources

### Understanding the Code

**Key Concepts:**
- React Hooks (useState, useRef, useEffect)
- WebSocket communication
- Canvas API for frame capture
- Base64 encoding
- Async/await patterns

**Recommended Reading:**
1. React Hooks documentation
2. WebSocket API guide
3. MediaDevices API (webcam access)
4. Canvas API tutorials
5. WebSocket security best practices

### Next Steps

1. Implement backend authentication
2. Add database for user management
3. Implement JWT token handling
4. Add session management
5. Create admin dashboard
6. Add analytics and logging
7. Implement multi-factor options
8. Add user profile management

---

**Built for secure, modern authentication with biometric liveliness detection**

For additional questions or support, please refer to the documentation or contact Moveris support.