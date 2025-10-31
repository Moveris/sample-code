# Moveris Sample Code Library

A comprehensive collection of sample projects demonstrating how to integrate the **Moveris Human Liveness Detection API** into your applications for biometric authentication and identity verification.

## Overview

This repository provides multiple implementations of the Moveris Liveness Detection API across different platforms and frameworks. Whether you're building a React web application, a Python automation script, or a Node.js backend service, you'll find a working example to get started quickly.

## Table of Contents

- [React Applications](#react-applications)
- [HTML5 Standalone Implementation](#html5-standalone-implementation)
- [Python Client](#python-client)
- [Node.js Client](#nodejs-client)
- [JavaScript/HTML Browser Clients](#javascripthtml-browser-clients)
- [How Moveris Liveness Detection Works](#how-moveris-liveness-detection-works)
- [Use Cases](#use-cases)
- [Performance Comparison](#performance-comparison)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)
- [Additional Resources](#additional-resources)

---

## React Applications

### Overview

Two full-featured React applications demonstrating production-ready integration of Moveris Liveness Detection.

#### **moveris-auth-system** - Production-Ready Authentication System
A complete React application demonstrating email/password authentication enhanced with biometric liveness verification.

**Features:**
- Full authentication flow with login interface
- Real-time webcam integration
- WebSocket-based liveness detection
- Live statistics dashboard (frames sent, connection status, processing metrics)
- Configurable frame rate (1-60 FPS) and image quality
- Responsive design for desktop and mobile
- Comprehensive error handling and user feedback
- 500-frame analysis for high-accuracy verification

#### **moveris-live-analysis** - Advanced Analysis Application
Similar to moveris-auth-system but optimized for testing and analyzing live video streams with enhanced performance metrics and includes a sample test video (BigBuckBunny.mp4).

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3, WebSocket API

### Project Structure

```
moveris-auth-system/  or  moveris-live-analysis/
├── src/
│   ├── App.jsx                     # Main application component
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Global styles
├── public/                         # Static assets
├── package.json                    # Dependencies
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS config
├── QUICKSTART.md                   # 5-minute setup guide
├── ENVIRONMENT_SETUP.md            # Detailed configuration
└── DEPLOYMENT.md                   # Production deployment guide
```

### Prerequisites

- **Node.js** v14.0.0 or higher
- **Modern browser** (Chrome, Firefox, Safari, Edge)
- **Moveris API Key** - Sign up at [developers.moveris.com](https://developers.moveris.com)

### Getting Started

```bash
# Navigate to either project
cd moveris-auth-system
# or
cd moveris-live-analysis

# Install dependencies
npm install

# Configure your API key (see Configuration section below)

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Configuration

Edit the `CONFIG` object in `src/App.jsx`:

```javascript
const CONFIG = {
  MOVERIS_WS_URI: "wss://developers.moveris.com/ws/live/v1/",
  MOVERIS_SECRET_KEY: "your_secret_key_here", // Get from Moveris dashboard
  FRAME_RATE: 10,              // Frames per second (1-60)
  IMAGE_QUALITY: 0.7,          // JPEG quality (0.1-1.0)
  REQUIRED_FRAMES: 500,        // Total frames for analysis
  ADMIN_EMAIL: "admin@example.com",
  ADMIN_PASSWORD: "Admin@123"
};
```

**Production Warning:** Never hardcode API keys in frontend code. Use a backend proxy to authenticate with Moveris API. See `DEPLOYMENT.md` in each project for detailed security implementation.

### Build Commands

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Documentation

- **QUICKSTART.md** - 5-minute setup guide
- **ENVIRONMENT_SETUP.md** - Detailed configuration options
- **DEPLOYMENT.md** - Production deployment with backend proxy
- **CLIENT_DOCUMENTATION.md** - Complete API reference

---

## HTML5 Standalone Implementation

### Overview

**moveris-live-stream** - A simple, single-file HTML5 implementation perfect for quick prototyping or integration into existing projects without React dependencies.

**Use Cases:**
- Quick testing and prototyping
- Integration into legacy applications
- Minimal dependency requirements
- Educational purposes
- Direct browser-based demos

**Tech Stack:** Pure HTML5, JavaScript, WebSocket API, Canvas API

### Project Structure

```
moveris-live-stream/
├── index.html                      # Complete standalone app
├── logo_small.png                  # Branding assets
└── MoverisLiveLogo.png             # Branding assets
```

### Prerequisites

- **Modern browser** (Chrome, Firefox, Safari, Edge)
- **Moveris API Key** - Sign up at [developers.moveris.com](https://developers.moveris.com)
- **No installation required** - runs directly in browser

### Getting Started

```bash
# Navigate to the directory
cd moveris-live-stream

# Option 1: Open directly in browser
# Double-click index.html or drag to browser

# Option 2: Serve with local server (recommended for HTTPS)
python -m http.server 8000
# Then open http://localhost:8000 in browser

# Option 3: Use Node.js http-server
npx http-server -p 8000
```

### Configuration

Edit the configuration section at the top of `index.html`:

```javascript
<script>
const CONFIG = {
  MOVERIS_WS_URI: "wss://developers.moveris.com/ws/live/v1/",
  MOVERIS_SECRET_KEY: "your_secret_key_here",
  FRAME_RATE: 10,
  IMAGE_QUALITY: 0.7,
  REQUIRED_FRAMES: 500
};
</script>
```

### Features

- Single-file implementation (easy to understand and modify)
- No build process or dependencies
- Webcam integration using MediaDevices API
- Canvas-based frame capture
- Real-time WebSocket communication
- Visual progress indicators
- Results display with confidence scores

---

## Python Client

### Overview

Developer-friendly Python client using OpenCV for camera capture and websockets for communication. Ideal for automation, scripting, and server-side integration.

**Key Features:**
- Full async WebSocket implementation
- OpenCV direct camera access (no file I/O)
- Efficient base64 encoding
- Performance metrics (ACK latency, FPS tracking)
- Memory-efficient circular buffer
- Auto-reconnect handling
- Color-coded logging
- Cross-platform support

**Tech Stack:** Python 3.7+, asyncio, websockets, OpenCV

### Project Structure

```
live/python/
└── moveris_client.py           # Complete Python client
```

### Prerequisites

- **Python** v3.7 or higher
- **pip** package manager
- **Webcam** connected to system

### Getting Started

```bash
# Navigate to Python client directory
cd live/python

# Install dependencies
pip install websockets opencv-python

# Configure your API key (see Configuration section)

# Run the client
python moveris_client.py
```

### Configuration

Edit variables at the top of `moveris_client.py`:

```python
# Moveris API Configuration
MOVERIS_WS_URI = "wss://developers.moveris.com/ws/live/v1/"
MOVERIS_SECRET_KEY = "your_secret_key_here"

# Performance Configuration
FRAME_RATE = 10              # Frames per second
IMAGE_QUALITY = 70           # JPEG quality (1-100)
REQUIRED_FRAMES = 500        # Total frames to send

# Camera Configuration
CAMERA_INDEX = 0             # Default camera (0 = first camera)
FRAME_WIDTH = 640            # Camera resolution width
FRAME_HEIGHT = 480           # Camera resolution height
```

### Advanced Features

**Async/Await Pattern:**
```python
async def main():
    async with websockets.connect(MOVERIS_WS_URI) as websocket:
        await authenticate(websocket)
        await capture_and_send_frames(websocket)
```

**Performance Tracking:**
- Frame acknowledgment latency
- Frames per second calculation
- Total processing time
- Memory usage monitoring

**Error Handling:**
- Automatic reconnection on disconnection
- Camera initialization retry logic
- Graceful shutdown on errors
- Detailed error logging

### Dependencies

```txt
websockets>=10.0
opencv-python>=4.5.0
```

---

## Node.js Client

### Overview

Production-ready Node.js client with FFmpeg integration for server-side video processing and enterprise backend integration.

**Key Features:**
- FFmpeg-based video capture
- Direct frame extraction and encoding
- Performance metrics tracking
- Cross-platform support (Windows, macOS, Linux)
- Async/await patterns
- Real-time acknowledgment tracking
- Suitable for server-side integration

**Tech Stack:** Node.js 14+, ws (WebSocket library), FFmpeg

### Project Structure

```
live/node/
├── moveris_client.js           # Main client code
└── package.json                # Dependencies
```

### Prerequisites

- **Node.js** v14.0.0 or higher
- **npm** package manager
- **FFmpeg** installed on system (for video capture)
- **Webcam** connected to system

### Installing FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt-get install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org) and add to PATH

### Getting Started

```bash
# Navigate to Node.js client directory
cd live/node

# Install dependencies
npm install

# Configure your API key (see Configuration section)

# Run the client
node moveris_client.js
```

### Configuration

Edit variables at the top of `moveris_client.js`:

```javascript
// Moveris API Configuration
const MOVERIS_WS_URI = "wss://developers.moveris.com/ws/live/v1/";
const MOVERIS_SECRET_KEY = "your_secret_key_here";

// Performance Configuration
const FRAME_RATE = 10;              // Frames per second
const IMAGE_QUALITY = 70;           // JPEG quality (1-100)
const REQUIRED_FRAMES = 500;        // Total frames to send

// Video Configuration
const VIDEO_DEVICE = "/dev/video0"; // Linux/macOS
// const VIDEO_DEVICE = "video=Integrated Camera"; // Windows
const FRAME_WIDTH = 640;
const FRAME_HEIGHT = 480;
```

### Dependencies

```json
{
  "name": "moveris-live-client",
  "version": "1.0.0",
  "dependencies": {
    "ws": "^8.14.0"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

### Advanced Features

**Promise-based API:**
```javascript
async function sendFrame(ws, frameData) {
  return new Promise((resolve, reject) => {
    ws.send(JSON.stringify({
      type: 'frame',
      data: frameData,
      timestamp: Date.now()
    }), (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
```

**Event Handling:**
```javascript
ws.on('message', (data) => {
  const message = JSON.parse(data);
  switch(message.type) {
    case 'frame_received':
      console.log(`Frame ${message.frame_count} acknowledged`);
      break;
    case 'processing_complete':
      console.log('Result:', message.result);
      break;
  }
});
```

---

## JavaScript/HTML Browser Clients

### Overview

Two browser-based JavaScript implementations demonstrating different approaches to client-side integration without frameworks.

**Sample 1:** Basic browser-based client with visual interface
**Sample 2:** Advanced implementation with modular camera integration

**Key Features:**
- No installation required (browser-based)
- Visual interface with real-time feedback
- Real-time WebSocket communication
- Canvas API for frame capture
- Works with all modern browsers
- Easy to customize and integrate

**Tech Stack:** HTML5, JavaScript ES6, WebSocket API, Canvas API

### Project Structure

```
live/js/
├── sample_1/
│   ├── moveris_client.html     # Basic implementation
│   └── *.png                   # Logo assets
└── sample_2/
    ├── index.html              # Advanced implementation
    └── camera-integration.js   # Modular camera code
```

### Prerequisites

- **Modern browser** (Chrome, Firefox, Safari, Edge)
- **Moveris API Key** - Sign up at [developers.moveris.com](https://developers.moveris.com)
- **HTTPS connection** (required for camera access in most browsers)

### Getting Started

#### Sample 1 - Basic Implementation

```bash
# Navigate to sample 1 directory
cd live/js/sample_1

# Open in browser
open moveris_client.html
# or double-click the file

# For HTTPS (recommended):
python -m http.server 8000
# Then open http://localhost:8000/moveris_client.html
```

#### Sample 2 - Advanced Implementation

```bash
# Navigate to sample 2 directory
cd live/js/sample_2

# Serve with local server
python -m http.server 8000
# or
npx http-server -p 8000

# Open http://localhost:8000 in browser
```

### Configuration

#### Sample 1: Edit configuration in `moveris_client.html`

```javascript
const config = {
  wsUri: "wss://developers.moveris.com/ws/live/v1/",
  secretKey: "your_secret_key_here",
  frameRate: 10,
  imageQuality: 0.7,
  requiredFrames: 500
};
```

#### Sample 2: Edit configuration in `index.html`

```javascript
const CONFIG = {
  MOVERIS_WS_URI: "wss://developers.moveris.com/ws/live/v1/",
  MOVERIS_SECRET_KEY: "your_secret_key_here",
  FRAME_RATE: 10,
  IMAGE_QUALITY: 0.7,
  REQUIRED_FRAMES: 500
};
```

### Features

**Sample 1 - Basic:**
- Simple, straightforward implementation
- All code in one file
- Visual progress indicators
- Basic error handling
- Easy to understand and modify

**Sample 2 - Advanced:**
- Modular code structure
- Separate camera integration module
- Enhanced error handling
- Performance optimizations
- Better code organization

### Code Examples

**Initialize Camera:**
```javascript
async function initCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true
  });
  videoElement.srcObject = stream;
}
```

**Capture Frame:**
```javascript
function captureFrame() {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0);

  return canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
}
```

**Send Frame via WebSocket:**
```javascript
function sendFrame(frameData) {
  const message = JSON.stringify({
    type: 'frame',
    data: frameData.split(',')[1], // Remove data:image/jpeg;base64,
    timestamp: Date.now()
  });

  websocket.send(message);
}
```

---

## How Moveris Liveness Detection Works

### The Liveness Detection Flow

1. **Connect** to Moveris WebSocket API
2. **Authenticate** with your secret API key
3. **Capture** video frames from user's webcam
4. **Transmit** frames as base64-encoded JPEG images
5. **Receive** acknowledgments for each frame
6. **Process** all frames on Moveris servers (AI analysis)
7. **Get Results** with confidence scores and metrics

### WebSocket Message Protocol

#### Client to Server Messages

**Authentication:**
```json
{
  "type": "auth",
  "secret_key": "your_secret_key"
}
```

**Frame Data:**
```json
{
  "type": "frame",
  "data": "base64_encoded_jpeg_data",
  "timestamp": 1635789012345
}
```

#### Server to Client Messages

**Authentication Required:**
```json
{
  "type": "auth_required"
}
```

**Authentication Success:**
```json
{
  "type": "auth_success",
  "message": "Authentication successful"
}
```

**Frame Acknowledgment:**
```json
{
  "type": "frame_received",
  "frame_count": 42
}
```

**Processing Started:**
```json
{
  "type": "processing_started",
  "total_frames": 500
}
```

**Processing Complete:**
```json
{
  "type": "processing_complete",
  "result": {
    "prediction": "live",
    "confidence": 0.95,
    "ai_probability": 0.98,
    "processing_time_seconds": 2.34,
    "ai_attention_level": "high",
    "ai_emotion_level": "neutral",
    "total_frames_analyzed": 500
  }
}
```

**Error:**
```json
{
  "type": "error",
  "message": "Error description"
}
```

### Understanding the Results

- **prediction**: `"live"` (real person) or `"not_live"` (photo/video/spoof)
- **confidence**: 0.0-1.0 score indicating prediction certainty
- **ai_probability**: 0.0-1.0 score from AI model
- **processing_time_seconds**: Total time for analysis
- **ai_attention_level**: User engagement level (high/medium/low)
- **ai_emotion_level**: Detected emotional state (neutral/happy/etc)

---

## Use Cases

Moveris Liveness Detection can enhance security and user verification in various industries:

### Financial Services
- **Online banking authentication** - Verify customers during high-value transactions
- **Account opening** - KYC (Know Your Customer) compliance
- **Credit applications** - Identity verification for loan approvals
- **ATM security** - Enhanced biometric verification

### Healthcare
- **Telemedicine** - Verify patient identity during virtual consultations
- **Prescription validation** - Ensure correct patient receives medication
- **Medical records access** - Secure access to sensitive health information
- **Insurance claims** - Prevent fraud in claim submissions

### Government & Public Services
- **Digital identity** - Secure online government services
- **Voting systems** - Remote voter verification
- **Benefits distribution** - Prevent identity fraud
- **Border control** - Automated passport verification

### Education
- **Online exams** - Prevent impersonation during remote testing
- **Course enrollment** - Verify student identity
- **Credential verification** - Academic integrity

### E-Commerce & Retail
- **Age verification** - Alcohol, tobacco, gambling sites
- **High-value purchases** - Additional security layer
- **Account recovery** - Verify account ownership
- **Fraud prevention** - Detect suspicious activity

### Corporate Security
- **Remote work authentication** - Secure access to corporate systems
- **Building access** - Physical security integration
- **Time tracking** - Verify employee presence
- **Sensitive data access** - Additional verification layer

---

## Performance Comparison

### Client Comparison Matrix

| Feature | React Apps | HTML5 | Python | Node.js | JS/HTML |
|---------|-----------|-------|--------|---------|---------|
| **Setup Time** | 2-3 min | Instant | 1 min | 2 min | Instant |
| **Memory Usage** | 100-150 MB | 50-80 MB | 40-60 MB | 80-120 MB | 50-80 MB |
| **CPU Usage** | 10-20% | 5-10% | 8-15% | 10-18% | 5-10% |
| **Image Quality** | Excellent | Good | Excellent | Excellent | Good |
| **Ease of Use** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Best For** | Production web apps | Quick testing | Automation | Backend services | Demos, prototypes |
| **Dependencies** | Node.js, npm | None | Python, OpenCV | Node.js, FFmpeg | None |
| **Platform** | Browser | Browser | Desktop/Server | Desktop/Server | Browser |

### Network Requirements (per 500 frames)

| Frame Rate | Quality | Data Transfer | Bandwidth | Completion Time |
|-----------|---------|---------------|-----------|----------------|
| 5 FPS | 60% | ~25 MB | ~500 Kbps | 100 seconds |
| 10 FPS | 70% | ~50 MB | ~1 Mbps | 50 seconds |
| 15 FPS | 80% | ~75 MB | ~2 Mbps | 33 seconds |
| 20 FPS | 90% | ~100 MB | ~3 Mbps | 25 seconds |

---

## Troubleshooting

### Camera Not Working

**Browser Permissions:**
- Ensure you've granted camera permissions to the browser
- Check browser settings > Privacy & Security > Camera
- Try accessing via HTTPS (required by most browsers)
- Clear browser cache and reload

**Hardware Issues:**
- Verify camera is connected and working in other applications
- Close other applications using the camera
- Try a different camera if available
- Check camera drivers are up to date

**Browser-Specific Issues:**
- Chrome: Check chrome://settings/content/camera
- Firefox: Check about:preferences#privacy
- Safari: Check System Preferences > Security & Privacy > Camera

### WebSocket Connection Failed

**Network Issues:**
- Check your internet connection
- Verify firewall isn't blocking WebSocket connections
- Try disabling VPN if connected
- Ensure you're using WSS (secure WebSocket)
- Check corporate proxy settings

**Authentication Errors:**
- Verify your API key is correct and not expired
- Check for extra spaces or quotes in the key
- Ensure your API key is active in Moveris dashboard
- Verify API key permissions and rate limits
- Check key hasn't been revoked

**Connection Timeout:**
- Server may be temporarily unavailable
- Check Moveris status page
- Try again after a few minutes
- Verify correct WebSocket URI

### Poor Performance

**Network Optimization:**
- Reduce frame rate (try 5-10 FPS)
- Lower image quality (try 60-70%)
- Check network bandwidth and latency
- Close bandwidth-intensive applications
- Use wired connection instead of WiFi

**CPU/Memory Issues:**
- Close unnecessary browser tabs
- Try a different browser (Chrome recommended)
- Ensure sufficient system resources
- Update to latest browser version
- Restart browser or application

**Frame Rate Issues:**
- System cannot keep up with configured frame rate
- Reduce target frame rate
- Lower image resolution
- Close resource-intensive applications

### Frame Processing Errors

**Image Quality Issues:**
- Ensure good lighting conditions
- Keep face centered in frame
- Avoid extreme angles or occlusions
- Remove glasses or accessories if detection fails
- Clean camera lens

**Timing Issues:**
- Increase frame rate for smoother capture
- Ensure stable network connection
- Check for consistent frame acknowledgments
- Monitor for dropped frames

**Detection Failures:**
- Face not clearly visible
- Poor lighting conditions
- Camera too close or too far
- Multiple faces in frame
- Face partially occluded

### Common Error Messages

**"Authentication failed"**
- Invalid or expired API key
- Check key format and validity
- Verify key hasn't been revoked
- Contact Moveris support

**"Invalid frame data"**
- Frame encoding issue
- Verify base64 encoding is correct
- Check JPEG quality settings
- Ensure frame data is not corrupted

**"Rate limit exceeded"**
- Sending frames too quickly
- Respect API rate limits
- Implement backoff strategy
- Check your plan limits

**"Connection timeout"**
- Network instability
- Server unreachable
- Check firewall settings
- Verify internet connection

**"Camera access denied"**
- Browser permissions not granted
- Check system camera permissions
- Try different browser
- Restart browser

---

## Security Best Practices

### Production Deployment

1. **Never expose API keys in frontend code**
   - Use backend proxy for API authentication
   - Store secrets in environment variables
   - Use secure key management systems (AWS Secrets Manager, Azure Key Vault)
   - Rotate keys regularly

2. **Use HTTPS/WSS only**
   - All production traffic must be encrypted
   - Configure SSL certificates properly
   - Enable HSTS headers
   - Use TLS 1.2 or higher

3. **Implement rate limiting**
   - Prevent abuse and API quota exhaustion
   - Add request throttling per user/IP
   - Monitor usage patterns
   - Set up alerts for unusual activity

4. **Validate all inputs**
   - Sanitize user inputs
   - Validate frame data before sending
   - Implement proper error handling
   - Prevent injection attacks

5. **Secure user data**
   - Don't store biometric data without explicit consent
   - Follow GDPR/CCPA regulations
   - Implement proper data retention policies
   - Use encryption at rest and in transit
   - Anonymize data when possible

6. **Monitor and log**
   - Track API usage and errors
   - Set up alerts for anomalies
   - Regular security audits
   - Keep dependencies updated
   - Log authentication attempts

### Backend Proxy Implementation

Instead of connecting directly from frontend, implement a backend proxy:

**Frontend (connects to your backend):**
```javascript
// Your frontend connects to YOUR backend, not Moveris directly
const ws = new WebSocket('wss://your-backend.com/api/liveness');

// Send frames to your backend
ws.send(JSON.stringify({
  type: 'frame',
  data: frameData,
  userId: currentUser.id
}));
```

**Backend Proxy (Node.js example):**
```javascript
const WebSocket = require('ws');

// Your backend connects to Moveris with the secret key
const moverisWs = new WebSocket('wss://developers.moveris.com/ws/live/v1/');

// Authenticate with Moveris using server-side secret
moverisWs.on('open', () => {
  moverisWs.send(JSON.stringify({
    type: 'auth',
    secret_key: process.env.MOVERIS_SECRET_KEY // From environment variable
  }));
});

// Forward frames from client to Moveris
clientWs.on('message', (data) => {
  const message = JSON.parse(data);

  // Add server-side validation, rate limiting, etc.
  if (isValidFrame(message)) {
    moverisWs.send(JSON.stringify(message));
  }
});

// Forward results back to client
moverisWs.on('message', (data) => {
  clientWs.send(data);
});
```

### Environment Variables

**Never commit secrets to version control:**

```bash
# .env file (add to .gitignore)
MOVERIS_SECRET_KEY=your_secret_key_here
MOVERIS_WS_URI=wss://developers.moveris.com/ws/live/v1/
```

**Load in your application:**

```javascript
// Node.js
require('dotenv').config();
const secretKey = process.env.MOVERIS_SECRET_KEY;

// Python
import os
secret_key = os.getenv('MOVERIS_SECRET_KEY')
```

### Additional Security Measures

- Implement CORS policies
- Use Content Security Policy (CSP) headers
- Enable XSS protection
- Implement CSRF protection
- Use secure session management
- Regular dependency updates (`npm audit`, `pip check`)
- Penetration testing
- Security code reviews

---

## Additional Resources

### Complete Repository Structure

```
sample-code/
├── README.md                           # This file
├── .gitignore                          # Git ignore rules
│
├── moveris-auth-system/                # React authentication system
│   ├── src/
│   │   ├── App.jsx                     # Main application component
│   │   ├── main.jsx                    # React entry point
│   │   └── index.css                   # Global styles
│   ├── public/                         # Static assets
│   ├── package.json                    # Dependencies
│   ├── vite.config.js                  # Vite configuration
│   ├── tailwind.config.js              # Tailwind CSS config
│   ├── QUICKSTART.md                   # 5-minute setup guide
│   ├── ENVIRONMENT_SETUP.md            # Detailed configuration
│   └── DEPLOYMENT.md                   # Production deployment guide
│
├── moveris-live-analysis/              # Advanced React analysis app
│   ├── src/
│   │   └── App.jsx                     # Analysis component
│   ├── public/
│   │   └── BigBuckBunny.mp4            # Sample test video
│   └── [same structure as auth-system]
│
├── moveris-live-stream/                # Minimal HTML5 implementation
│   ├── index.html                      # Complete standalone app
│   └── *.png                           # Logo assets
│
└── live/                               # Multi-language clients
    ├── node/                           # Node.js client
    │   ├── moveris_client.js           # Main client code
    │   └── package.json                # Dependencies (ws)
    │
    ├── python/                         # Python client
    │   └── moveris_client.py           # Main client code
    │
    └── js/                             # JavaScript clients
        ├── sample_1/
        │   └── moveris_client.html     # Basic implementation
        └── sample_2/
            ├── index.html              # Advanced implementation
            └── camera-integration.js   # Modular camera code
```

### Moveris API Documentation
- **Developer Portal:** [developers.moveris.com](https://developers.moveris.com)
- **API Reference:** Complete WebSocket API documentation
- **Dashboard:** Manage API keys, view usage, access analytics
- **Status Page:** Check service availability

### Support Channels
- **Technical Support:** support@moveris.com
- **Sales Inquiries:** sales@moveris.com
- **GitHub Issues:** Report bugs or request features
- **Documentation:** Comprehensive integration guides

### Community Resources
- **Blog:** Latest updates and integration guides
- **Examples Gallery:** More sample implementations
- **Best Practices:** Security and performance guides
- **Video Tutorials:** Step-by-step implementation guides
- **Developer Forum:** Community discussions and Q&A

### Quick Links

- [React App Quick Start](./moveris-auth-system/QUICKSTART.md)
- [Deployment Guide](./moveris-auth-system/DEPLOYMENT.md)
- [Performance Benchmarks](./moveris-auth-system/CLIENT_SUMMARY.md)
- [Complete API Reference](./moveris-auth-system/CLIENT_DOCUMENTATION.md)

## Contributing

This is a sample code repository. For production implementations:

1. Review security best practices above
2. Implement backend authentication proxy
3. Add comprehensive error handling
4. Follow your organization's coding standards
5. Conduct security audits
6. Test across multiple devices and browsers
7. Load testing for production traffic
8. Monitor and log all API usage

## License

These sample implementations are provided for demonstration and educational purposes. Refer to Moveris API terms of service for production usage.

## Version History

- **v1.0.0** - Initial release
  - React authentication system (moveris-auth-system)
  - Advanced React analysis app (moveris-live-analysis)
  - HTML5 standalone implementation
  - Python client with OpenCV
  - Node.js client with FFmpeg
  - JavaScript/HTML browser clients (2 samples)
  - Full authentication flow with email/password login
  - Real-time liveness detection with 500-frame analysis
  - Comprehensive documentation and deployment guides

---

## Getting Started Checklist

- [ ] Choose the implementation that fits your tech stack
- [ ] Sign up for Moveris API key at [developers.moveris.com](https://developers.moveris.com)
- [ ] Install prerequisites for your chosen implementation
- [ ] Clone or download this repository
- [ ] Configure your API key (see relevant section above)
- [ ] Test with development server
- [ ] Review security best practices
- [ ] Implement backend proxy for production
- [ ] Deploy and monitor

---

**Ready to get started?** Jump to the section for your chosen implementation:
- [React Applications](#react-applications)
- [HTML5 Standalone](#html5-standalone-implementation)
- [Python Client](#python-client)
- [Node.js Client](#nodejs-client)
- [JavaScript/HTML Clients](#javascripthtml-browser-clients)

For questions or support, contact the Moveris team at support@moveris.com or visit [developers.moveris.com](https://developers.moveris.com).
