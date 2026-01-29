# Moveris Sample Code Library

A comprehensive collection of sample projects demonstrating how to integrate the **Moveris Human Liveness Detection API** into your applications for biometric authentication and identity verification.

## What's New: V2 SDK 🚀

The React applications have been updated to use the **Moveris V2 SDK** (`@moveris/react` and `@moveris/shared`), providing:

- **Simplified Integration** - No manual WebSocket handling required
- **Built-in Components** - `LivenessView`, `LivenessModal`, `LivenessCamera`
- **Smart Capture** - Automatic face detection and quality checks
- **Real-time Feedback** - Oval guide with color-coded positioning feedback
- **Multiple Models** - Choose from 10, 50, or 250 frame models
- **TypeScript Support** - Full type definitions included

## Table of Contents

- [V2 SDK Quick Start](#v2-sdk-quick-start)
- [React Applications (V2 SDK)](#react-applications-v2-sdk)
- [HTML5 Standalone Implementation](#html5-standalone-implementation)
- [Python Client](#python-client)
- [Node.js Client](#nodejs-client)
- [JavaScript/HTML Browser Clients](#javascripthtml-browser-clients)
- [Migration from V1 to V2](#migration-from-v1-to-v2)
- [How Moveris Liveness Detection Works](#how-moveris-liveness-detection-works)
- [Use Cases](#use-cases)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

---

## V2 SDK Quick Start

The fastest way to add liveness detection to your React app:

### 1. Install the SDK

```bash
npm install @moveris/react @moveris/shared
```

### 2. Wrap Your App with MoverisProvider

```tsx
import { MoverisProvider, LivenessView } from '@moveris/react';

function App() {
  return (
    <MoverisProvider apiKey="mv_your_api_key_here" model="50">
      <YourApp />
    </MoverisProvider>
  );
}
```

### 3. Add LivenessView Component

```tsx
function VerificationPage() {
  const handleResult = (result) => {
    if (result.verdict === 'live') {
      console.log('User is verified!');
    }
  };

  return (
    <LivenessView
      model="50"
      onResult={handleResult}
      onError={(error) => console.error(error)}
      showOverlay={true}
      showControls={true}
      autoStartCamera={true}
    />
  );
}
```

That's it! The SDK handles camera access, face detection, frame capture, and API communication.

---

## React Applications (V2 SDK)

### Overview

Three React applications demonstrating production-ready integration with the Moveris V2 SDK.

#### **login_with_moveris** - Full Onboarding Flow (TypeScript)

A complete React + TypeScript application with multi-step onboarding and liveness verification.

**Location:** `live/js/login_with_moveris/`

**Features:**
- Multi-step onboarding form
- Liveness verification using `LivenessView` component
- shadcn/ui components
- TypeScript support
- React Router navigation

**Quick Start:**
```bash
cd live/js/login_with_moveris
npm install
cp .env.example .env
# Edit .env and add your VITE_MOVERIS_API_KEY
npm run dev
```

#### **moveris-auth-system** - Authentication + Liveness

Login flow with email/password authentication enhanced with liveness verification.

**Location:** `moveris-auth-system/`

**Features:**
- Email/password login
- V2 SDK `LivenessView` integration
- Detection results display
- Model selection (10/50/250 frames)

**Quick Start:**
```bash
cd moveris-auth-system
npm install
cp .env.example .env
# Edit .env and add your VITE_MOVERIS_API_KEY
npm run dev
```

#### **moveris-live-analysis** - Video Analysis Demo

Advanced demo with model selection and expandable camera view.

**Location:** `moveris-live-analysis/`

**Features:**
- Dynamic model selection (10/50/250 frames)
- Expandable webcam preview
- Sample video playback (BigBuckBunny.mp4)
- Real-time analysis feedback

**Quick Start:**
```bash
cd moveris-live-analysis
npm install
cp .env.example .env
# Edit .env and add your VITE_MOVERIS_API_KEY
npm run dev
```

### V2 SDK Configuration

All React apps use environment variables for configuration:

```env
# Required: Your Moveris API Key
VITE_MOVERIS_API_KEY=mv_your_api_key_here

# Model: '10', '50', or '250' frames
VITE_MOVERIS_MODEL=50

# Optional: Custom base URL
# VITE_MOVERIS_BASE_URL=https://staging.api.moveris.com

# Enable debug mode
VITE_MOVERIS_DEBUG=false
```

### Model Options

| Model | Frames | Capture Time | Accuracy | Best For |
|-------|--------|--------------|----------|----------|
| `10`  | 10     | ~1 sec       | Good     | Quick checks, low friction UX |
| `50`  | 50     | ~5 sec       | 93.8%    | Balanced (recommended) |
| `250` | 250    | ~25 sec      | Highest  | High-security scenarios |

### SDK Components Reference

#### MoverisProvider

Wraps your app and provides context to all SDK components:

```tsx
<MoverisProvider
  apiKey="mv_your_key"  // Required
  model="50"            // Default model: '10' | '50' | '250'
  baseUrl="..."         // Optional: custom API URL
  debug={false}         // Enable debug logging
>
  {children}
</MoverisProvider>
```

#### LivenessView

All-in-one component with camera, overlay, and controls:

```tsx
<LivenessView
  model="50"                    // Model to use
  onResult={(result) => {}}     // Success callback
  onError={(error) => {}}       // Error callback
  showOverlay={true}            // Show face guide overlay
  showControls={true}           // Show start/stop buttons
  showResult={true}             // Show result after completion
  autoStartCamera={true}        // Auto-start camera
  statusMessages={{             // Custom status messages
    idle: "Position your face",
    capturing: "Hold still...",
  }}
/>
```

#### LivenessModal

Modal wrapper for LivenessView:

```tsx
<LivenessModal
  mode="modal"                  // 'inline' | 'modal'
  title="Verify Your Identity"
  triggerButtonText="Start"
  onResult={handleResult}
  onClose={() => {}}
/>
```

#### useLiveness Hook

For custom implementations:

```tsx
const {
  state,      // 'idle' | 'capturing' | 'uploading' | 'processing' | 'complete' | 'error'
  result,     // LivenessResult | null
  error,      // Error | null
  progress,   // { current: number, total: number }
  start,      // () => void
  stop,       // () => void
  reset,      // () => void
} = useLiveness({
  model: '50',
  onResult: (result) => {},
  onError: (error) => {},
});
```

---

## Migration from V1 to V2

### Before (V1 - WebSocket)

The V1 implementation required manual WebSocket handling:

```javascript
// Complex WebSocket setup
const ws = new WebSocket(CONFIG.MOVERIS_WS_URI);

ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'auth', token: SECRET_KEY }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'auth_success') {
    startFrameCapture();
  }
  // ... handle many message types
};

// Manual frame capture
function captureFrame() {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
}

// Send frames at interval
setInterval(() => {
  const frame = captureFrame();
  ws.send(JSON.stringify({
    type: 'frame',
    frame_number: frameCount++,
    frame_data: frame,
    timestamp: Date.now() / 1000
  }));
}, 1000 / FRAME_RATE);
```

### After (V2 - SDK)

```tsx
import { MoverisProvider, LivenessView } from '@moveris/react';

// That's all you need!
<MoverisProvider apiKey={API_KEY}>
  <LivenessView 
    onResult={(result) => {
      if (result.verdict === 'live') {
        navigate('/success');
      }
    }}
  />
</MoverisProvider>
```

### Key Differences

| Feature | V1 (WebSocket) | V2 (SDK) |
|---------|----------------|----------|
| Connection | Manual WebSocket | Automatic |
| Frame Capture | Manual canvas | Built-in |
| Face Detection | None | Built-in (MediaPipe) |
| Quality Checks | None | Automatic |
| Progress Tracking | Manual | Built-in |
| Error Handling | Manual | Built-in |
| TypeScript | No | Full support |

---

## HTML5 Standalone Implementation

### Overview

**moveris-live-stream** - A simple, single-file HTML5 implementation using the V1 WebSocket API. Perfect for quick prototyping or legacy integrations.

**Location:** `moveris-live-stream/`

**Note:** This uses the V1 WebSocket API. For new projects, we recommend using the React SDK.

```bash
cd moveris-live-stream
python -m http.server 8000
# Open http://localhost:8000
```

---

## Python Client

### Overview

Developer-friendly Python client using OpenCV for camera capture and websockets for communication.

**Location:** `live/python/`

```bash
cd live/python
pip install websockets opencv-python
# Edit moveris_client.py with your API key
python moveris_client.py
```

---

## Node.js Client

### Overview

Production-ready Node.js client with FFmpeg integration for server-side video processing.

**Location:** `live/node/`

```bash
cd live/node
npm install
# Edit moveris_client.js with your API key
node moveris_client.js
```

---

## JavaScript/HTML Browser Clients

### Overview

Two browser-based JavaScript implementations demonstrating V1 WebSocket integration.

**Location:** `live/js/sample_1/` and `live/js/sample_2/`

---

## How Moveris Liveness Detection Works

### V2 SDK Flow (Recommended)

1. **Initialize** SDK with API key
2. **Start Camera** - SDK requests camera access
3. **Face Detection** - Real-time detection with visual guide
4. **Smart Capture** - Frames captured when quality is good
5. **API Submission** - Frames sent to Moveris API
6. **Result** - Verdict returned (live/fake)

### V1 WebSocket Flow (Legacy)

1. **Connect** to Moveris WebSocket API
2. **Authenticate** with your secret API key
3. **Capture** video frames from webcam
4. **Transmit** frames as base64-encoded JPEG
5. **Receive** acknowledgments for each frame
6. **Process** on Moveris servers
7. **Get Results** with confidence scores

### Understanding Results

```typescript
interface LivenessResult {
  verdict: 'live' | 'fake';   // Primary result
  confidence: number;          // 0.0-1.0 confidence score
  score: number;               // 0-100 numeric score
  sessionId: string;           // Unique session identifier
}
```

---

## Use Cases

- **Financial Services** - KYC, account opening, transaction verification
- **Healthcare** - Telemedicine identity verification
- **Government** - Digital identity, remote voting
- **Education** - Online exam proctoring
- **E-Commerce** - Age verification, fraud prevention
- **Corporate** - Remote work authentication

---

## Troubleshooting

### V2 SDK Issues

**"MoverisProvider not found"**
- Ensure components are wrapped with `<MoverisProvider>`

**"Invalid API key"**
- Check your `VITE_MOVERIS_API_KEY` in `.env`
- Verify key is active at [developers.moveris.com](https://developers.moveris.com)

**Camera not starting**
- Check browser camera permissions
- Ensure HTTPS (required for camera access)
- Try a different browser

### Common Issues

**Face detection not working**
- Ensure good lighting
- Keep face centered in frame
- Remove glasses/accessories if needed
- Check camera is not too close/far

---

## Security Best Practices

1. **Never expose API keys in frontend code** - Use environment variables
2. **Use HTTPS only** - Required for camera access
3. **Implement backend proxy** for production
4. **Validate all inputs** on server side
5. **Follow GDPR/CCPA** for biometric data

---

## Repository Structure

```
sample-code/
├── README.md                           # This file
├── live/
│   ├── js/
│   │   └── login_with_moveris/         # React + TypeScript (V2 SDK)
│   │   └── sample_1/                   # Vanilla JS (V1 WebSocket)
│   │   └── sample_2/                   # Vanilla JS (V1 WebSocket)
│   ├── node/                           # Node.js client (V1 WebSocket)
│   └── python/                         # Python client (V1 WebSocket)
├── moveris-auth-system/                # React auth demo (V2 SDK)
├── moveris-live-analysis/              # React analysis demo (V2 SDK)
└── moveris-live-stream/                # HTML5 standalone (V1 WebSocket)
```

---

## Resources

- **Developer Portal:** [developers.moveris.com](https://developers.moveris.com)
- **V2 SDK Docs:** `@moveris/react` and `@moveris/shared`
- **Support:** support@moveris.com

## Version History

- **v2.0.0** - V2 SDK Integration
  - Updated React apps to use `@moveris/react` SDK
  - Added `LivenessView`, `LivenessModal` components
  - Built-in face detection and smart capture
  - TypeScript support
  - Simplified configuration

- **v1.0.0** - Initial release
  - WebSocket-based implementations
  - React, Python, Node.js, and vanilla JS clients

---

**Ready to get started?** Check out the [V2 SDK Quick Start](#v2-sdk-quick-start) or visit [developers.moveris.com](https://developers.moveris.com) for your API key.
