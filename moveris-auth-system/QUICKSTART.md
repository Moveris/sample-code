# Quick Start Guide - V2 SDK

Get the Moveris Liveliness Authentication system running in 5 minutes using the **V2 SDK**.

## Prerequisites

- Node.js 16+ installed
- Moveris developer account with API key
- Webcam-enabled device

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

This installs:
- React & React DOM
- **@moveris/react** - V2 React SDK
- **@moveris/shared** - V2 Shared utilities
- lucide-react (UI icons)
- Tailwind CSS (styling)
- Vite (build tool)

### 2. Get Moveris API Key

1. Sign up at [Moveris Developer Portal](https://developers.moveris.com)
2. Create a new application
3. Copy your **API Key** (format: `mv_xxxxxxxx`)

### 3. Configure Application

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your API key:
```env
VITE_MOVERIS_API_KEY=mv_your_api_key_here
VITE_MOVERIS_MODEL=50
VITE_MOVERIS_DEBUG=false
VITE_ADMIN_EMAIL=admin@example.com
VITE_ADMIN_PASSWORD=Admin@123
```

### 4. Run Development Server

```bash
npm run dev
```

Open browser to `http://localhost:5173`

## Testing the Flow

1. **Enter login credentials**
   - Email: admin@example.com
   - Password: Admin@123
2. **Click "Sign In"** button
3. **Allow webcam access** when prompted
4. **Position your face** in the oval guide
5. **Hold still** while frames are captured
6. **Wait for processing** (a few seconds)
7. **Success!** You should see verification results

## What Should Happen

```
Step 1: Login Screen
├─ Shows email/password form
├─ Enter: admin@example.com / Admin@123
└─ Info about 2FA liveness check

Step 2: Email/Password Authentication
├─ Validates credentials
└─ Proceeds to liveness stage

Step 3: Liveness Check (V2 SDK)
├─ Requests webcam access
├─ Shows face detection oval guide
├─ Real-time feedback (position your face)
├─ Captures frames when quality is good
├─ Automatic API submission
└─ Receives liveness result

Step 4: Success/Failure
├─ Success: Shows detection results and user profile
└─ Failure: Shows error with retry option
```

## V2 SDK Advantages

The V2 SDK handles all the complexity for you:

| V1 (WebSocket) | V2 (SDK) |
|----------------|----------|
| Manual WebSocket connection | Automatic |
| Manual frame capture | Built-in |
| No face detection | Real-time face detection |
| No quality checks | Automatic quality checks |
| 500+ frames needed | 10-250 frames (configurable) |
| ~50 seconds | ~5 seconds (50-frame model) |

## Model Options

```env
# Choose your model in .env
VITE_MOVERIS_MODEL=10   # Fast: ~1 second, good accuracy
VITE_MOVERIS_MODEL=50   # Balanced: ~5 seconds, 93.8% accuracy (default)
VITE_MOVERIS_MODEL=250  # Thorough: ~25 seconds, highest accuracy
```

## Troubleshooting

### "Failed to access webcam"
- **Fix**: Click lock icon in address bar → Allow camera

### "Invalid email or password"
- **Fix**: Use admin@example.com / Admin@123

### "Invalid API key"
- **Fix**: Check your `VITE_MOVERIS_API_KEY` in `.env`
- Verify key is active at developers.moveris.com

### Black video screen
- **Fix**: Close other apps using camera (Zoom, Teams, etc.)

### Face detection not working
- **Fix**: Ensure good lighting, face centered in frame

## Understanding the V2 SDK Code

### Key Components

```jsx
// MoverisProvider - Wraps your app
<MoverisProvider apiKey={API_KEY} model="50">
  {/* Your components */}
</MoverisProvider>

// LivenessView - All-in-one component
<LivenessView
  model="50"
  onResult={(result) => {
    if (result.verdict === 'live') {
      // User is verified!
    }
  }}
  onError={(error) => console.error(error)}
  showOverlay={true}
  showControls={true}
  autoStartCamera={true}
/>
```

### Result Object

```javascript
{
  verdict: 'live',        // 'live' or 'fake'
  confidence: 0.95,       // 0.0-1.0 confidence score
  score: 95,              // 0-100 numeric score
  sessionId: 'uuid-...'   // Unique session ID
}
```

## Next Steps

- Read [README.md](../README.md) for comprehensive documentation
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Check component code comments for detailed explanations
- Explore Moveris SDK documentation for advanced features

## Success Checklist

- [x] Dependencies installed (including @moveris/react)
- [x] API key configured in .env
- [x] Development server running
- [x] Can see login page
- [x] Login works with demo credentials
- [x] Webcam activates
- [x] Face detection oval appears
- [x] Liveness detected successfully

**You're ready to build!** 🚀

---

**Estimated Total Time**: 5 minutes

For detailed documentation, see [README.md](../README.md)
