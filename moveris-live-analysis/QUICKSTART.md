# Quick Start Guide - V2 SDK

Get the Moveris Live Analysis demo running in 5 minutes using the **V2 SDK**.

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
4. **Click webcam preview** to expand
5. **Select model** (10, 50, or 250 frames)
6. **Position your face** and hold still
7. **Wait for analysis** to complete
8. **View results** with confidence scores

## Features of This Demo

- **Demo Video Playback** - BigBuckBunny.mp4 for testing
- **Model Selection** - Switch between 10/50/250 frames in real-time
- **Expandable Webcam** - Click to expand/minimize camera view
- **Real-time Feedback** - Face detection with positioning guide

## Model Comparison

| Model | Frames | Time | Accuracy | Use Case |
|-------|--------|------|----------|----------|
| 10 | 10 | ~1 sec | Good | Quick verification |
| 50 | 50 | ~5 sec | 93.8% | Balanced (default) |
| 250 | 250 | ~25 sec | Highest | High-security |

## Troubleshooting

### "Failed to access webcam"
- **Fix**: Click lock icon in address bar → Allow camera

### "Invalid API key"
- **Fix**: Check your `VITE_MOVERIS_API_KEY` in `.env`

### Video not playing
- **Fix**: Check that `BigBuckBunny.mp4` is in the `public/` folder

### Face detection issues
- **Fix**: Ensure good lighting and face is centered

## V2 SDK Code Example

```jsx
import { MoverisProvider, LivenessView } from '@moveris/react';

function App() {
  return (
    <MoverisProvider apiKey={import.meta.env.VITE_MOVERIS_API_KEY}>
      <LivenessView
        model="50"
        onResult={(result) => {
          console.log('Verdict:', result.verdict);
          console.log('Confidence:', result.confidence);
        }}
        showOverlay={true}
        showControls={true}
        autoStartCamera={true}
      />
    </MoverisProvider>
  );
}
```

## Next Steps

- Read [README.md](./README.md) for comprehensive documentation
- Try different models to compare accuracy/speed
- Review the V2 SDK component props
- Explore [developers.moveris.com](https://developers.moveris.com) for more info

---

**Estimated Total Time**: 5 minutes

For detailed documentation, see [README.md](./README.md)
