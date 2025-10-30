# Quick Start Guide - Moveris Live Clients

## Choose Your Client

### 🌐 HTML/JavaScript (Easiest)
**Best for:** Quick testing, demos, non-technical users

```bash
# Just open in browser
open moveris_client_optimized.html
```

✅ No installation
✅ Visual interface
✅ Works everywhere

---

### 🐍 Python (Recommended)
**Best for:** Developers, automation, scripting

```bash
# Install
pip install websockets opencv-python

# Run
python moveris_client.py
```

✅ Easy to customize
✅ Good performance
✅ Cross-platform

---

### 🟢 Node.js (Advanced)
**Best for:** Node.js developers, integration

```bash
# Install
npm install ws
brew install ffmpeg  # or apt-get/choco

# Run
node moveris_client.js
```

✅ FFmpeg quality
✅ Production ready
✅ Cross-platform

---

## 5-Minute Setup

### Step 1: Get Your Secret Key
- Contact Moveris support
- Or check your developer dashboard

### Step 2: Choose & Install Client

**HTML/JS:**
```bash
# No installation needed!
open moveris_client_optimized.html
```

**Python:**
```bash
pip install websockets opencv-python
python moveris_client.py
```

**Node.js:**
```bash
npm install ws
# Install FFmpeg (see docs)
node moveris_client.js
```

### Step 3: Configure

All clients ask for:
1. **Secret Key** (required)
2. **Frame Rate** (default: 10 FPS)
3. **Quality** (default: 70)

### Step 4: Start Streaming!

The client will:
1. ✅ Connect to server
2. ✅ Authenticate
3. ✅ Start camera
4. ✅ Stream frames
5. ✅ Show results

---

## Example Output

```
[14:23:45] ✅ Connected successfully
[14:23:45] 🔑 Authenticating...
[14:23:46] ✅ Authentication successful
[14:23:46] 📷 Camera started
[14:23:46] 🎥 Capturing at 10 FPS
[14:23:50] 📊 Frame 50 ACK | Buffer: 50 | Avg ACK: 12ms
[14:23:55] 📊 Frame 100 ACK | Buffer: 100 | Avg ACK: 11ms
[14:24:15] 🔄 Processing 500 frames...
[14:24:18] ✅ Processing complete: 500 frames
   Prediction: Real
   AI Probability: 23.45%
   Confidence: 0.8765
   Processing Time: 2.45s
```

---

## Performance Tips

### For Best Results:

1. **Start Low, Go High**
   - Begin with 5 FPS, quality 60
   - Increase gradually

2. **Check Your Network**
   - Need stable connection
   - ~1 Mbps for 10 FPS @ quality 70

3. **Monitor Metrics**
   - ACK time < 50ms = good
   - ACK time > 100ms = slow connection

4. **Adjust Settings**
   - Slow network? Lower FPS or quality
   - Fast network? Increase both

---

## Troubleshooting (1-Minute Fixes)

### Camera Not Working?
```bash
# Python
python -c "import cv2; print(cv2.VideoCapture(0).isOpened())"
# Should print: True

# Node.js
ffmpeg -f avfoundation -list_devices true -i ""
# Should list your camera
```

### Connection Failed?
```bash
# Test WebSocket
curl https://developers.moveris.com/
# Should connect

# Check secret key
# Remove spaces, check for typos
```

### Slow Performance?
```bash
# Reduce settings:
Frame Rate: 5 (instead of 10)
Quality: 50 (instead of 70)
```

---

## Common Commands

### Python
```bash
# Install
pip install websockets opencv-python

# Run
python moveris_client.py

# With custom settings
# Edit script or use interactive prompts
```

### Node.js
```bash
# Install
npm install ws

# Run
node moveris_client.js

# Make executable
chmod +x moveris_client.js
./moveris_client.js
```

### HTML/JS
```bash
# Option 1: Direct open
open moveris_client_optimized.html

# Option 2: Local server
python -m http.server 8000
# Visit: http://localhost:8000
```

---

## Files Included

```
📁 moveris-clients/
├── 📄 moveris_client_optimized.html  # HTML/JS client
├── 📄 moveris_client.py              # Python client
├── 📄 moveris_client.js              # Node.js client
├── 📄 CLIENT_DOCUMENTATION.md        # Full docs
├── 📄 QUICK_START.md                 # This file
└── 📄 requirements.txt               # Python deps
```

---

## What Each Client Needs

| Client | Dependencies | Camera | Platform |
|--------|--------------|--------|----------|
| **HTML/JS** | Browser only | Built-in | Any with browser |
| **Python** | websockets, opencv-python | System webcam | Windows, macOS, Linux |
| **Node.js** | ws, ffmpeg | FFmpeg | Windows, macOS, Linux |

---

## Next Steps

1. ✅ Get your secret key
2. ✅ Choose a client
3. ✅ Install dependencies
4. ✅ Run and test
5. ✅ Read full docs for advanced features

---

## Need Help?

1. **Check Logs** - All clients show detailed logs
2. **Read Docs** - See CLIENT_DOCUMENTATION.md
3. **Test Connection** - Try `curl https://developers.moveris.com/`
4. **Contact Support** - Email Moveris team

---

## Pro Tips

💡 **Start Simple**: Use HTML/JS client first for testing

💡 **Monitor Metrics**: Watch ACK times and FPS

💡 **Save Your Config**: Create a config file for secret key

💡 **Test Locally**: Verify camera works before streaming

💡 **Check Bandwidth**: Ensure stable internet connection

---

**Ready to start?** Pick your client and follow the steps above!

Questions? Check CLIENT_DOCUMENTATION.md for detailed information.
