# Moveris Sample Code Library

A comprehensive collection of sample projects demonstrating how to integrate the **Moveris Human Liveness Detection API** into your React applications using the V2 SDK.

## Features

The **Moveris V2 SDK** (`@moveris/react` and `@moveris/shared`) provides:

- **Simplified Integration** - Just wrap your app and add a component
- **Built-in Components** - `LivenessView`, `LivenessModal`, `LivenessCamera`
- **Smart Capture** - Automatic face detection and quality checks
- **Real-time Feedback** - Oval guide with color-coded positioning feedback
- **Multiple Models** - Choose from 10, 50, or 250 frame models
- **TypeScript Support** - Full type definitions included

## Table of Contents

- [Quick Start](#quick-start)
- [React Applications](#react-applications)
- [SDK Components Reference](#sdk-components-reference)
- [Model Options](#model-options)
- [How It Works](#how-it-works)
- [Use Cases](#use-cases)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

---

## Quick Start

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
    <MoverisProvider apiKey="mv_your_api_key_here" model="10">
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
      model="10"
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

## React Applications

Three React applications demonstrating production-ready integration with the Moveris V2 SDK.

### **login_with_moveris** - Full Onboarding Flow (TypeScript)

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

### **moveris-auth-system** - Authentication + Liveness

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

### **moveris-live-analysis** - Video Analysis Demo

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

### Configuration

All React apps use environment variables for configuration:

```env
# Required: Your Moveris API Key
VITE_MOVERIS_API_KEY=mv_your_api_key_here

# Optional: API Base URL
VITE_MOVERIS_BASE_URL=https://api.moveris.com

# Model: '10', '50', or '250' frames
VITE_MOVERIS_MODEL=10

# Enable debug mode
VITE_MOVERIS_DEBUG=false
```

---

## SDK Components Reference

### MoverisProvider

Wraps your app and provides context to all SDK components:

```tsx
<MoverisProvider
  apiKey="mv_your_key"  // Required
  model="10"            // Default model: '10' | '50' | '250'
  baseUrl="..."         // Optional: custom API URL
  debug={false}         // Enable debug logging
>
  {children}
</MoverisProvider>
```

### LivenessView

All-in-one component with camera, overlay, and controls:

```tsx
<LivenessView
  model="10"                    // Model to use
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

### LivenessModal

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

### useLiveness Hook

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
  model: '10',
  onResult: (result) => {},
  onError: (error) => {},
});
```

---

## Model Options

| Model | Frames | Capture Time | Accuracy | Best For |
|-------|--------|--------------|----------|----------|
| `10`  | 10     | ~1 sec       | Good     | Quick checks, low friction UX |
| `50`  | 50     | ~5 sec       | 93.8%    | Balanced |
| `250` | 250    | ~25 sec      | Highest  | High-security scenarios |

---

## How It Works

### SDK Flow

1. **Initialize** SDK with API key
2. **Start Camera** - SDK requests camera access
3. **Face Detection** - Real-time detection with visual guide
4. **Smart Capture** - Frames captured when quality is good
5. **API Submission** - Frames sent to Moveris API
6. **Result** - Verdict returned (live/fake)

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

### Common Issues

**"MoverisProvider not found"**
- Ensure components are wrapped with `<MoverisProvider>`

**"Invalid API key"**
- Check your `VITE_MOVERIS_API_KEY` in `.env`
- Verify key is active at [developers.moveris.com](https://developers.moveris.com)

**Camera not starting**
- Check browser camera permissions
- Ensure HTTPS (required for camera access)
- Try a different browser

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
│   └── js/
│       └── login_with_moveris/         # React + TypeScript (V2 SDK)
├── moveris-auth-system/                # React auth demo (V2 SDK)
└── moveris-live-analysis/              # React analysis demo (V2 SDK)
```

---

## Resources

- **Developer Portal:** [developers.moveris.com](https://developers.moveris.com)
- **SDK Documentation:**
  - [@moveris/react](https://www.npmjs.com/package/@moveris/react) - React components and hooks
  - [@moveris/shared](https://www.npmjs.com/package/@moveris/shared) - Core utilities and types
- **Support:** support@moveris.com

---

**Ready to get started?** Check out the [Quick Start](#quick-start) or visit [developers.moveris.com](https://developers.moveris.com) for your API key.
