# Moveris Live - Client Documentation

## Overview

This package includes three optimized WebSocket clients for streaming video to the Moveris AI Detection API:

1. **HTML/JavaScript** - Browser-based client with UI
2. **Python** - Command-line client using OpenCV
3. **Node.js** - Command-line client using FFmpeg

## Key Optimizations

### All Clients

✅ **Circular Buffer Management** - Efficient memory usage for performance tracking
✅ **Deferred Frame Validation** - Quick acknowledgments, validation later
✅ **Batch Logging** - Reduces log spam (every 50-100 frames)
✅ **Automatic Cleanup** - Old tracking data purged automatically
✅ **Connection Resilience** - Proper error handling and recovery
✅ **Performance Metrics** - Real-time ACK latency and FPS tracking

### HTML/JS Optimizations

- **Canvas Reuse** - Single canvas instance (no recreation)
- **Reduced UI Updates** - Update metrics every 10 frames (not every frame)
- **Efficient Event Handling** - Proper cleanup on disconnect
- **Memory Management** - Auto-purge logs (keep last 100 entries)
- **Circular Buffers** - Custom implementation for ack/frame times

### Python Optimizations

- **OpenCV Direct Capture** - No intermediate file writes
- **Async WebSocket** - Non-blocking I/O
- **JPEG Compression** - Configurable quality
- **Efficient Base64** - Direct buffer encoding
- **Clean Shutdown** - Proper resource cleanup

### Node.js Optimizations

- **FFmpeg Streaming** - Direct pipe, no file I/O
- **JPEG Boundary Detection** - Efficient frame extraction
- **Buffer Management** - Minimal memory footprint
- **Cross-platform** - Works on Windows, macOS, Linux

---

## 1. HTML/JavaScript Client

### Features
- 🎨 Professional UI with real-time stats
- 📊 Performance metrics (ACK latency, FPS, etc.)
- 📷 Browser webcam access
- 🔄 Real-time prediction display
- 📝 Console-style logging

### Setup

**No installation required!** Just open in a web browser.

```bash
# Open directly
open moveris_client_optimized.html

# Or serve with a local server
python -m http.server 8000
# Then visit: http://localhost:8000/moveris_client_optimized.html
```

### Usage

1. Open the HTML file in your browser
2. Enter your secret key
3. Optionally adjust:
   - Frame rate (1-60 FPS)
   - Image quality (0.1-1.0)
4. Click "Start Streaming"
5. Allow camera access when prompted

### Browser Requirements
- Modern browser (Chrome, Firefox, Safari, Edge)
- WebSocket support
- Camera access permissions

---

## 2. Python Client

### Features
- 🐍 Pure Python implementation
- 📷 OpenCV webcam capture
- ⚡ Async WebSocket communication
- 📊 Performance metrics
- 🎨 Color-coded logging

### Installation

```bash
# Install dependencies
pip install websockets opencv-python

# Or using requirements.txt
pip install -r requirements.txt
```

**requirements.txt:**
```
websockets>=11.0
opencv-python>=4.8.0
```

### Usage

```bash
# Run the client
python moveris_client.py

# Follow the prompts:
# 1. Enter secret key
# 2. Enter frame rate (default: 10)
# 3. Enter JPEG quality (default: 70)
```

### Advanced Usage

```python
from moveris_client import MoverisClient
import asyncio

async def custom_streaming():
    client = MoverisClient(
        ws_url="wss://developers.moveris.com/ws/live/v1/",
        secret_key="your-secret-key",
        frame_rate=15,
        quality=80
    )
    
    await client.start_streaming()

asyncio.run(custom_streaming())
```

### Configuration Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `ws_url` | str | Required | WebSocket URL |
| `secret_key` | str | Required | API secret key |
| `frame_rate` | int | 10 | Frames per second |
| `quality` | int | 70 | JPEG quality (1-100) |

### System Requirements
- Python 3.7+
- Webcam
- ~50MB RAM per stream

---

## 3. Node.js Client

### Features
- 🟢 Node.js/JavaScript implementation
- 📷 FFmpeg webcam capture
- 🔄 Async/await patterns
- 📊 Real-time metrics
- 🎨 Color-coded terminal output
- 🖥️ Cross-platform (Windows, macOS, Linux)

### Installation

```bash
# Install dependencies
npm install ws

# Install FFmpeg (platform-specific)
```

**Install FFmpeg:**

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**Windows:**
```bash
# Download from: https://ffmpeg.org/download.html
# Or use Chocolatey:
choco install ffmpeg
```

**package.json:**
```json
{
  "name": "moveris-client",
  "version": "1.0.0",
  "description": "Moveris Live WebSocket Client",
  "main": "moveris_client.js",
  "dependencies": {
    "ws": "^8.14.0"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

### Usage

```bash
# Make executable (Unix/macOS)
chmod +x moveris_client.js

# Run the client
node moveris_client.js

# Or if made executable:
./moveris_client.js

# Follow the prompts:
# 1. Enter secret key
# 2. Enter frame rate (default: 10)
# 3. Enter JPEG quality (default: 70)
```

### Platform-Specific Notes

**macOS:**
- Camera input: `0:0` (AVFoundation)
- Works with built-in FaceTime camera

**Linux:**
- Camera input: `/dev/video0` (V4L2)
- May need permissions: `sudo chmod 666 /dev/video0`

**Windows:**
- Camera input: `video="Integrated Camera"` (DirectShow)
- May need to adjust device name in code

### Configuration

Edit the camera device in the code if needed:

```javascript
// For Windows, change device name:
'-i', 'video=Your Camera Name'

// For Linux, change device path:
'-i', '/dev/video1'  // if /dev/video0 doesn't work
```

### System Requirements
- Node.js 14+
- FFmpeg
- Webcam
- ~100MB RAM per stream

---

## Performance Comparison

| Metric | HTML/JS | Python | Node.js |
|--------|---------|--------|---------|
| **Startup Time** | Instant | ~2s | ~2s |
| **Memory Usage** | 50-80MB | 40-60MB | 80-120MB |
| **CPU Usage** | Low | Low-Medium | Medium |
| **Frame Quality** | Good | Excellent | Excellent |
| **Ease of Use** | Easiest | Easy | Medium |
| **Platform Support** | Browser | Python 3.7+ | Node 14+ |

---

## WebSocket Protocol

### Message Types

#### Client → Server

**1. Authentication**
```json
{
    "type": "auth",
    "token": "your-secret-key"
}
```

**2. Frame Data**
```json
{
    "type": "frame",
    "frame_number": 123,
    "frame_data": "base64-encoded-jpeg",
    "timestamp": 1234567890.123
}
```

#### Server → Client

**1. Auth Required**
```json
{
    "type": "auth_required",
    "message": "Please send your Bearer token"
}
```

**2. Auth Success**
```json
{
    "type": "auth_success",
    "message": "Authentication successful"
}
```

**3. Frame Received (ACK)**
```json
{
    "type": "frame_received",
    "frame_number": 123,
    "total_frames": 123
}
```

**4. Processing Started**
```json
{
    "type": "processing_started",
    "message": "Processing 500 frames..."
}
```

**5. Processing Complete**
```json
{
    "type": "processing_complete",
    "result": {
        "prediction": "Real",
        "ai_probability": 0.23,
        "confidence": 0.8765,
        "processing_time_seconds": 2.45,
        "ai_attention_level": 0.75,
        "ai_emotion_level": 0.82,
        "ai_detection_level": 23,
        "human_likelihood_level": 77
    },
    "frames_processed": 500,
    "timestamp": 1234567890.123
}
```

**6. Error**
```json
{
    "type": "error",
    "message": "Error description",
    "timestamp": 1234567890.123
}
```

**7. Disconnect**
```json
{
    "type": "disconnect",
    "reason": "max_frames_reached"
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Camera not found"

**HTML/JS:**
- Check browser permissions
- Ensure HTTPS (required for camera access)
- Try different browser

**Python:**
- Check camera index: `ls /dev/video*` (Linux)
- Try different camera: `cv2.VideoCapture(1)`
- Install camera drivers

**Node.js:**
- Verify FFmpeg installation: `ffmpeg -version`
- Check device name (especially Windows)
- Run with sudo on Linux if permission denied

#### 2. "Connection refused"

- Check internet connection
- Verify WebSocket URL
- Check firewall settings
- Ensure secret key is correct

#### 3. "Slow performance"

- Reduce frame rate (e.g., 5 FPS instead of 10)
- Lower quality (e.g., 50 instead of 70)
- Check CPU usage
- Close other applications

#### 4. High memory usage

- Expected: 50-120MB per client
- If higher:
  - Restart client
  - Check for memory leaks in modifications
  - Update to latest version

#### 5. Frames not being acknowledged

- Check network latency
- Verify WebSocket connection is stable
- Look for errors in console/logs
- Try reducing frame rate

---

## Best Practices

### Frame Rate Selection

| Use Case | Recommended FPS | Quality |
|----------|----------------|---------|
| Testing | 5-10 | 60-70 |
| Production | 10-15 | 70-80 |
| High Quality | 15-20 | 80-90 |
| Low Bandwidth | 3-5 | 50-60 |

### Quality Settings

- **50-60**: Low bandwidth, acceptable quality
- **70-80**: Balanced (recommended)
- **80-90**: High quality, more bandwidth
- **90-100**: Maximum quality, high bandwidth

### Network Requirements

| FPS | Quality | Bandwidth | Latency |
|-----|---------|-----------|---------|
| 5 | 60 | ~500 Kbps | <100ms |
| 10 | 70 | ~1 Mbps | <100ms |
| 15 | 80 | ~2 Mbps | <50ms |
| 20 | 90 | ~3 Mbps | <50ms |

---

## Security Best Practices

1. **Never commit secret keys** to version control
2. **Use environment variables** for secrets
3. **Rotate keys regularly** (monthly recommended)
4. **Monitor API usage** for suspicious activity
5. **Use HTTPS/WSS** only (never WS over HTTP)

### Environment Variables

**Python:**
```python
import os
SECRET_KEY = os.environ.get('MOVERIS_SECRET_KEY')
```

**Node.js:**
```javascript
const SECRET_KEY = process.env.MOVERIS_SECRET_KEY;
```

**HTML/JS:**
```javascript
// Use a config file (not in repo)
// config.js (in .gitignore)
const config = { secretKey: 'your-key' };
```

---

## Development & Testing

### Testing Locally

1. Start with low frame rate (5 FPS)
2. Monitor console for errors
3. Check performance metrics
4. Gradually increase settings

### Debugging

**Enable verbose logging:**

**Python:**
```python
logging.basicConfig(level=logging.DEBUG)
```

**Node.js:**
```javascript
// Add DEBUG=* before command
DEBUG=* node moveris_client.js
```

**HTML/JS:**
- Open browser DevTools (F12)
- Check Console and Network tabs
- Monitor WebSocket frames

---

## API Limits

| Limit Type | Value | Note |
|------------|-------|------|
| Max Frames/Session | 1500 | Auto-disconnect |
| Frame Batch Size | 500 | Processing trigger |
| Max Frame Size | ~500KB | Depends on quality |
| Connection Timeout | 5 min | No activity |
| Rate Limit | N/A | Contact support |

---

## Support

### Getting Help

1. **Documentation**: Check this file first
2. **Server Logs**: Enable verbose logging
3. **GitHub Issues**: Report bugs
4. **Email Support**: Contact Moveris team

### Reporting Issues

Include:
- Client type (HTML/Python/Node.js)
- Platform (OS, browser, versions)
- Error messages
- Steps to reproduce
- Network conditions

---

## License

Check with Moveris for licensing terms.

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Add tests
4. Submit pull request

---

## Changelog

### v1.0.0 (2025-10-30)
- ✅ Initial release
- ✅ HTML/JS client
- ✅ Python client
- ✅ Node.js client
- ✅ Optimized performance
- ✅ Cross-platform support

---

**Questions?** Check the troubleshooting section or contact support.
