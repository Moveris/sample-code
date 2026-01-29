# Moveris Live Analysis Demo

A React demo application showcasing the **Moveris V2 SDK** for liveness detection with dynamic model selection and video analysis features.

## Features

- **V2 SDK Integration** - Uses `@moveris/react` for liveness detection
- **Model Selection** - Switch between 10, 50, or 250 frame models
- **Expandable Camera** - Click to expand/minimize webcam preview
- **Demo Video** - Sample video playback (BigBuckBunny.mp4)
- **Built-in Face Detection** - Real-time oval guide
- **Modern UI** - Tailwind CSS and Lucide React icons

## Quick Start

### Prerequisites

- Node.js 16+
- Moveris API Key (get from [developers.moveris.com](https://developers.moveris.com))
- Modern browser with webcam

### Installation

```bash
# Clone the repository
git clone https://github.com/Moveris/sample-code.git
cd sample-code/moveris-live-analysis

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your VITE_MOVERIS_API_KEY

# Start development server
npm run dev
```

### Test the Application

1. Open `http://localhost:5173`
2. Login with: `admin@example.com` / `Admin@123`
3. Allow webcam access
4. Click on the camera preview to expand
5. Select a model (10, 50, or 250 frames)
6. Position your face and wait for verification

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

# Demo credentials
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
  const [selectedModel, setSelectedModel] = useState('10');
  
  return (
    <MoverisProvider apiKey={API_KEY} model={selectedModel}>
      <div>
        {/* Model selector */}
        {['10', '50', '250'].map((model) => (
          <button
            key={model}
            onClick={() => setSelectedModel(model)}
            className={selectedModel === model ? 'active' : ''}
          >
            {model} frames
          </button>
        ))}
        
        {/* Liveness view */}
        <LivenessView
          model={selectedModel}
          onResult={(result) => {
            console.log('Verdict:', result.verdict);
          }}
          showOverlay={true}
          autoStartCamera={true}
        />
      </div>
    </MoverisProvider>
  );
}
```

## Project Structure

```
moveris-live-analysis/
├── src/
│   ├── App.jsx          # Main app with model selection
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind styles
├── public/
│   └── BigBuckBunny.mp4 # Demo video
├── .env.example         # Environment template
├── package.json         # Dependencies
└── README.md            # This file
```

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

## Troubleshooting

**Camera not starting**
- Check browser permissions
- Ensure HTTPS connection

**Face detection not working**
- Ensure good lighting
- Keep face centered

**"Invalid API key"**
- Check `VITE_MOVERIS_API_KEY` in `.env`

## License

MIT License

## Support

- **Developer Portal:** [developers.moveris.com](https://developers.moveris.com)
- **SDK Documentation:**
  - [@moveris/react](https://www.npmjs.com/package/@moveris/react) - React components and hooks
  - [@moveris/shared](https://www.npmjs.com/package/@moveris/shared) - Core utilities and types
- **Support:** support@moveris.com
