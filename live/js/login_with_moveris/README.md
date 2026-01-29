# Login with Moveris - V2 SDK Demo

A React + TypeScript application demonstrating integration with the **Moveris V2 SDK** (`@moveris/react`) for human liveness detection during user onboarding.

## What's New in V2 SDK

The V2 SDK provides a significantly simpler integration experience:

- **No WebSocket handling** - The SDK manages all API communication internally
- **Built-in face detection** - Real-time face detection with oval guide
- **Smart frame capture** - Automatic quality checks and frame selection
- **React components** - Ready-to-use `LivenessView`, `LivenessModal`, and more
- **TypeScript support** - Full type definitions included

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Moveris/sample-code.git

# Navigate to this project
cd sample-code/live/js/login_with_moveris

# Install dependencies
npm install

# Create your .env file
cp .env.example .env

# Add your API key to .env
# VITE_MOVERIS_API_KEY=mv_your_api_key_here

# Start development server
npm run dev
```

## Configuration

Create a `.env` file with your Moveris API key:

```env
# Required: Your Moveris API Key
VITE_MOVERIS_API_KEY=mv_your_api_key_here

# Model: '10', '50', or '250' frames
VITE_MOVERIS_MODEL=50

# Enable debug mode for development
VITE_MOVERIS_DEBUG=false
```

## V2 SDK Usage

### Basic Setup with MoverisProvider

```tsx
import { MoverisProvider, LivenessView } from '@moveris/react';

function App() {
  return (
    <MoverisProvider 
      apiKey={import.meta.env.VITE_MOVERIS_API_KEY}
      model="50"
    >
      <LivenessVerification />
    </MoverisProvider>
  );
}
```

### Using LivenessView Component

The easiest way to add liveness verification:

```tsx
import { LivenessView, type LivenessResult } from '@moveris/react';

function LivenessVerification() {
  const handleResult = (result: LivenessResult) => {
    if (result.verdict === 'live') {
      console.log('User verified!', result.confidence);
    } else {
      console.log('Verification failed');
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

### Using useLiveness Hook (Advanced)

For custom implementations:

```tsx
import { useLiveness } from '@moveris/react';

function CustomLiveness() {
  const {
    state,       // 'idle' | 'capturing' | 'uploading' | 'processing' | 'complete' | 'error'
    result,      // LivenessResult | null
    error,       // Error | null
    progress,    // { current: number, total: number }
    start,       // () => void
    stop,        // () => void
    reset,       // () => void
  } = useLiveness({
    model: '50',
    onResult: (result) => console.log(result),
    onError: (error) => console.error(error),
  });

  return (
    <div>
      <p>State: {state}</p>
      <p>Progress: {progress.current}/{progress.total}</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

## Available Models

| Model | Frames | Capture Time | Accuracy | Use Case |
|-------|--------|--------------|----------|----------|
| `10`  | 10     | ~1 second    | Good     | Quick checks, low friction |
| `50`  | 50     | ~5 seconds   | 93.8%    | Balanced (recommended) |
| `250` | 250    | ~25 seconds  | High     | High-security scenarios |

## Project Structure

```
src/
├── components/
│   ├── WebcamCapture.tsx    # Reusable webcam component (V2 SDK)
│   └── ui/                  # shadcn/ui components
├── pages/
│   ├── Landing.tsx          # Landing page
│   ├── Register.tsx         # Registration page
│   ├── Onboarding.tsx       # Multi-step onboarding with liveness (V2 SDK)
│   ├── Payment.tsx          # Success page
│   └── Error.tsx            # Error handling page
└── App.tsx                  # Router setup
```

## Technologies

- **React 18** + **TypeScript**
- **Vite 5** - Fast build tool
- **@moveris/react** - Moveris V2 SDK
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **React Router** - Navigation

## Migration from V1

If you're migrating from the WebSocket-based V1 implementation:

### Before (V1 - WebSocket)

```javascript
// Manual WebSocket handling
const ws = new WebSocket(CONFIG.MOVERIS_WS_URI);
ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'auth', token: SECRET_KEY }));
};
// ... complex frame capture and message handling
```

### After (V2 - SDK)

```tsx
// Simple SDK integration
<MoverisProvider apiKey={API_KEY}>
  <LivenessView onResult={handleResult} />
</MoverisProvider>
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Resources

- [Moveris Developer Portal](https://developers.moveris.com)
- [@moveris/react Documentation](../../docs/api-reference.md#react-package)
- [@moveris/shared Documentation](../../docs/api-reference.md#shared-package)

## License

MIT - See Moveris API terms of service for production usage.
