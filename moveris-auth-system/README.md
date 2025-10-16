# Moveris Liveliness Authentication System

A production-ready React authentication system that combines Google OAuth with real-time liveliness detection using Moveris API. This provides a secure two-factor authentication where the second factor is biometric liveliness verification instead of traditional OTP.

## 🎯 Features

- **Google OAuth Integration** - Secure user authentication via Google
- **Real-time Liveliness Detection** - WebSocket-based live person verification
- **Webcam Frame Streaming** - Captures and streams video frames for analysis
- **Modern UI/UX** - Built with Tailwind CSS and Lucide React icons
- **Well-Documented Code** - Comprehensive comments and clear structure
- **Error Handling** - Robust error management and user feedback
- **Responsive Design** - Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- Google OAuth 2.0 Client ID
- Moveris API credentials (WebSocket URI and Auth Token)
- Modern browser with webcam support

### Installation

1. **Clone or download this repository**

```bash
git clone <your-repo-url>
cd moveris-auth-system
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure credentials**

Open `src/App.jsx` and update the `CONFIG` object:

```javascript
const CONFIG = {
  GOOGLE_CLIENT_ID: "your-google-client-id.apps.googleusercontent.com",
  MOVERIS_WS_URI: "wss://developers.moveris.com/ws/live/v1/",
  MOVERIS_AUTH_TOKEN: "Bearer your_moveris_token_here",
  FRAME_CAPTURE_INTERVAL: 500,
  LIVELINESS_DURATION: 5000,
};
```

4. **Start development server**

```bash
npm run dev
```

5. **Open your browser**

Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🔧 Configuration Guide

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - Your production domain
7. Copy the Client ID and update `GOOGLE_CLIENT_ID` in config

### Moveris API Setup

1. Sign up at [Moveris Developer Portal](https://developers.moveris.com)
2. Create a new application
3. Copy your WebSocket URI and authentication token
4. Update `MOVERIS_WS_URI` and `MOVERIS_AUTH_TOKEN` in config

### Configuration Options

```javascript
const CONFIG = {
  // Google OAuth Client ID
  GOOGLE_CLIENT_ID: "string",
  
  // Moveris WebSocket endpoint
  MOVERIS_WS_URI: "wss://...",
  
  // Moveris authentication token (include "Bearer " prefix)
  MOVERIS_AUTH_TOKEN: "Bearer ...",
  
  // Time between frame captures (milliseconds)
  FRAME_CAPTURE_INTERVAL: 500,
  
  // Total duration for liveliness check (milliseconds)
  LIVELINESS_DURATION: 5000,
};
```

## 📋 Authentication Flow

```
┌─────────────────┐
│  User visits    │
│  application    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Click "Sign in  │
│  with Google"   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Google OAuth    │
│  verification   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Initialize     │
│  webcam access  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Connect to      │
│ Moveris WebSocket│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Send auth token │
│  to Moveris     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Capture & send  │
│  video frames   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Moveris analyzes│
│  liveliness     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Success/Failure │
│    Response     │
└─────────────────┘
```

## 🏗️ Project Structure

```
moveris-auth-system/
├── src/
│   ├── App.jsx              # Main application component
│   └── main.jsx             # React entry point
├── public/
│   └── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔌 API Integration

### Moveris WebSocket Protocol

#### 1. Connection
```javascript
const ws = new WebSocket("wss://developers.moveris.com/ws/live/v1/");
```

#### 2. Authentication
After connection, send:
```json
{
  "type": "auth",
  "token": "Bearer YOUR_TOKEN_HERE"
}
```

#### 3. Frame Transmission
Send video frames as base64 JPEG:
```json
{
  "type": "frame",
  "frame_data": "base64_encoded_jpeg_data",
  "frame_number": 1
}
```

#### 4. Response Handling
Expected responses:
```json
// Success
{
  "type": "auth_success",
  "status": "ok"
}

// Detection result
{
  "type": "detection_result",
  "live": true,
  "confidence": 0.95
}

// Error
{
  "type": "error",
  "message": "Error description"
}
```

## 🎨 Customization

### Styling

The application uses Tailwind CSS. Customize colors in the component:

```javascript
// Primary color (currently indigo)
className="bg-indigo-600"

// Change to blue
className="bg-blue-600"
```

### Frame Capture Settings

Adjust capture frequency and duration:

```javascript
FRAME_CAPTURE_INTERVAL: 500, // Faster: 250ms, Slower: 1000ms
LIVELINESS_DURATION: 5000,   // Shorter: 3000ms, Longer: 10000ms
```

### Video Quality

Modify webcam constraints:

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: { 
    width: { ideal: 1280 },  // Higher resolution
    height: { ideal: 720 },
    facingMode: 'user'
  },
  audio: false
});
```

## 🔒 Security Considerations

1. **Never commit credentials** - Use environment variables in production
2. **HTTPS required** - Webcam access requires secure context
3. **Token security** - Store Moveris token securely (backend recommended)
4. **CORS configuration** - Ensure proper CORS headers for production
5. **Rate limiting** - Implement on backend to prevent abuse

## 🌐 Deployment

### Environment Variables

Create `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_MOVERIS_WS_URI=wss://developers.moveris.com/ws/live/v1/
VITE_MOVERIS_AUTH_TOKEN=Bearer your_token
```

Update config to use environment variables:

```javascript
const CONFIG = {
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  MOVERIS_WS_URI: import.meta.env.VITE_MOVERIS_WS_URI,
  MOVERIS_AUTH_TOKEN: import.meta.env.VITE_MOVERIS_AUTH_TOKEN,
  // ...
};
```

### Build for Production

```bash
npm run build
```

Deploy the `dist/` folder to your hosting service (Vercel, Netlify, etc.)

### Important: Production Considerations

⚠️ **Security Warning**: In production, never expose Moveris auth tokens in frontend code. Instead:

1. Create a backend API endpoint
2. Store Moveris token on backend
3. Frontend calls your backend
4. Backend authenticates with Moveris and proxies WebSocket connection

Example backend proxy (Node.js/Express):

```javascript
// Backend endpoint
app.post('/api/auth/liveliness', authenticateUser, (req, res) => {
  // Verify user is authenticated
  // Create WebSocket connection to Moveris with server-side token
  // Proxy frames between client and Moveris
});
```

## 🐛 Troubleshooting

### Webcam not working
- Ensure HTTPS (or localhost for development)
- Check browser permissions
- Verify camera is not in use by another application

### Google login fails
- Verify Client ID is correct
- Check authorized origins in Google Console
- Ensure correct redirect URIs

### WebSocket connection fails
- Verify Moveris credentials
- Check network/firewall settings
- Ensure WebSocket URL is correct (wss://)

### Frames not sending
- Check browser console for errors
- Verify video element has loaded
- Ensure canvas capture is working

## 📚 Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "@react-oauth/google": "^0.12.1",
  "lucide-react": "^0.263.1"
}
```

## 🤝 Contributing

This is a reference implementation for developers. Feel free to:

- Fork and customize for your needs
- Report issues or suggestions
- Submit improvements via pull requests

## 📄 License

MIT License - feel free to use in your projects

## 🆘 Support

- Moveris API Documentation: https://developers.moveris.com/docs
- Google OAuth Documentation: https://developers.google.com/identity/protocols/oauth2
- React OAuth Google: https://www.npmjs.com/package/@react-oauth/google

## 💡 Example Use Cases

- **Banking applications** - Enhanced login security
- **Healthcare portals** - Patient identity verification
- **Government services** - Citizen authentication
- **Corporate systems** - Employee access control
- **Exam platforms** - Student identity verification
- **KYC processes** - Remote identity verification

---

**Built with ❤️ for secure authentication**

For questions or support, please refer to Moveris and Google OAuth documentation.