# Moveris Authentication System

A React authentication demo that combines email/password login with real-time liveness detection using the **Moveris V2 SDK**. This provides secure two-factor authentication where the second factor is biometric liveness verification.

## Features

- **Email/Password Authentication** - Simple login system
- **V2 SDK Integration** - Uses `@moveris/react` for liveness detection
- **Built-in Face Detection** - Real-time face detection with oval guide
- **Smart Frame Capture** - Automatic quality checks
- **Model Selection** - Choose from 10, 50, or 250 frame models
- **Modern UI/UX** - Built with Tailwind CSS and Lucide React icons
- **Responsive Design** - Works on desktop and mobile

## Quick Start

### Prerequisites

- Node.js 16+
- Moveris API Key (get from [developers.moveris.com](https://developers.moveris.com))
- Modern browser with webcam

### Installation

```bash
# Clone the repository
git clone https://github.com/Moveris/sample-code.git
cd sample-code/moveris-auth-system

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your VITE_MOVERIS_API_KEY

# Start development server
npm run dev
```

### Test the System

1. Open `http://localhost:5173`
2. Login with: `admin@example.com` / `Admin@123`
3. Allow webcam access when prompted
4. Position your face in the oval guide
5. Wait for verification to complete

## Configuration

### Environment Variables

```env
# Required: Your Moveris API Key
VITE_MOVERIS_API_KEY=mv_your_api_key_here

# Optional: API Base URL
VITE_MOVERIS_BASE_URL=https://api.moveris.com

# Model: '10', '50', or '250' frames
VITE_MOVERIS_MODEL=10

# Enable debug mode
VITE_MOVERIS_DEBUG=false

# Demo credentials (development only)
VITE_ADMIN_EMAIL=admin@example.com
VITE_ADMIN_PASSWORD=Admin@123
```

### Model Options

| Model | Frames | Time | Accuracy | Best For |
|-------|--------|------|----------|----------|
| `10` | 10 | ~1 sec | Good | Quick checks |
| `50` | 50 | ~5 sec | 93.8% | Balanced |
| `250` | 250 | ~25 sec | Highest | High-security |

## SDK Integration

### Basic Usage

```jsx
import { MoverisProvider, LivenessView } from '@moveris/react';

function App() {
  return (
    <MoverisProvider apiKey={API_KEY} model="10">
      <LivenessView
        onResult={(result) => {
          if (result.verdict === 'live') {
            console.log('User verified!');
          }
        }}
        onError={(error) => console.error(error)}
        showOverlay={true}
        showControls={true}
        autoStartCamera={true}
      />
    </MoverisProvider>
  );
}
```

### Understanding Results

```typescript
interface LivenessResult {
  verdict: 'live' | 'fake';   // Primary result
  confidence: number;          // 0.0-1.0 confidence score
  score: number;               // 0-100 numeric score
  sessionId: string;           // Unique session identifier
}
```

## Project Structure

```
moveris-auth-system/
├── src/
│   ├── App.jsx          # Main application with V2 SDK
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind styles
├── .env.example         # Environment template
├── package.json         # Dependencies
└── README.md            # This file
```

## Authentication Flow

```
1. User enters email/password
2. Frontend validates credentials
3. On success, camera initializes
4. V2 SDK captures frames with quality checks
5. Frames sent to Moveris API
6. Liveness result returned
7. User granted/denied access
```

## Security Best Practices

1. **Never expose API keys** - Use environment variables
2. **Use HTTPS** - Required for camera access
3. **Implement backend proxy** for production
4. **Validate credentials on server** - Don't trust frontend

## Troubleshooting

**Camera not starting**
- Check browser permissions
- Ensure HTTPS connection
- Close other apps using camera

**Face detection not working**
- Ensure good lighting
- Keep face centered
- Remove glasses if needed

**"Invalid API key"**
- Check `VITE_MOVERIS_API_KEY` in `.env`
- Verify key is active at developers.moveris.com

## Dependencies

```json
{
  "@moveris/react": "^1.0.0",
  "@moveris/shared": "^1.0.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "lucide-react": "^0.263.1"
}
```

## License

MIT License

## Support

- **Developer Portal:** [developers.moveris.com](https://developers.moveris.com)
- **SDK Documentation:**
  - [@moveris/react](https://www.npmjs.com/package/@moveris/react) - React components and hooks
  - [@moveris/shared](https://www.npmjs.com/package/@moveris/shared) - Core utilities and types
- **Support:** support@moveris.com
