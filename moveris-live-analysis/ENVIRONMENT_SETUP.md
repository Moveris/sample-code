# Environment Variables Setup Guide

This guide explains how to configure environment variables for the Moveris Authentication System.

## 📋 Quick Setup

### 1. Create .env File

Copy the example file and customize it:

```bash
cp .env.example .env
```

### 2. Edit .env File

Open `.env` and update with your actual values:

```env
# Moveris API Configuration
VITE_MOVERIS_WS_URI=wss://dev.api.moveris.com/ws/live/v1/
VITE_MOVERIS_SECRET_KEY=your_actual_secret_key_here

# Frame Capture Settings
VITE_FRAME_RATE=10
VITE_IMAGE_QUALITY=0.7
VITE_REQUIRED_FRAMES=500

# Demo Authentication Credentials
VITE_ADMIN_EMAIL=admin@example.com
VITE_ADMIN_PASSWORD=Admin@123
```

### 3. Restart Development Server

After changing `.env`, restart the server:

```bash
npm run dev
```

## 🔧 Environment Variables Reference

### VITE_MOVERIS_WS_URI
- **Description**: Moveris WebSocket API endpoint
- **Required**: Yes
- **Default**: `wss://dev.api.moveris.com/ws/live/v1/`
- **Example**: `wss://dev.api.moveris.com/ws/live/v1/`
- **Notes**: Use the WebSocket URL provided by Moveris

### VITE_MOVERIS_SECRET_KEY
- **Description**: Your Moveris API secret key for authentication
- **Required**: Yes
- **Default**: Empty string (will cause authentication to fail)
- **Example**: `sk_live_abc123xyz456`
- **Notes**: 
  - Get this from your Moveris dashboard
  - Keep this secure and never commit to version control
  - Do NOT include "Bearer" prefix

### VITE_FRAME_RATE
- **Description**: Number of frames captured per second
- **Required**: No
- **Default**: `10`
- **Valid Range**: 1-60
- **Recommended**: 10-15 for balance of speed and accuracy
- **Examples**:
  - `5` - Slower, lower bandwidth
  - `10` - Balanced (recommended)
  - `15` - Faster processing
  - `30` - High frame rate (more bandwidth)

### VITE_IMAGE_QUALITY
- **Description**: JPEG compression quality for captured frames
- **Required**: No
- **Default**: `0.7`
- **Valid Range**: 0.1-1.0
- **Recommended**: 0.6-0.8 for balance
- **Examples**:
  - `0.5` - Lower quality, smaller file size
  - `0.7` - Balanced (recommended)
  - `0.9` - High quality, larger file size

### VITE_REQUIRED_FRAMES
- **Description**: Total number of frames needed for complete analysis
- **Required**: No
- **Default**: `500`
- **Recommended**: 500 (as per Moveris requirements)
- **Notes**: 
  - At 10 FPS: 500 frames ≈ 50 seconds
  - At 15 FPS: 500 frames ≈ 33 seconds

### VITE_ADMIN_EMAIL
- **Description**: Demo login email address
- **Required**: No
- **Default**: `admin@example.com`
- **Security**: ⚠️ For development only! Use backend authentication in production
- **Example**: `demo@yourcompany.com`

### VITE_ADMIN_PASSWORD
- **Description**: Demo login password
- **Required**: No
- **Default**: `Admin@123`
- **Security**: ⚠️ For development only! Never use in production
- **Example**: `DemoPass123!`

## 🔒 Security Best Practices

### Development Environment

1. **Create .env file** for local development
2. **Add .env to .gitignore** (already included)
3. **Never commit .env** to version control
4. **Use .env.example** to document required variables

### Production Environment

⚠️ **CRITICAL: Do not use environment variables for sensitive data in production frontend!**

**Instead:**
1. Store Moveris secret key on backend server
2. Store credentials in secure database
3. Use backend API for authentication
4. Proxy Moveris WebSocket through backend

**Frontend .env for production should only contain:**
```env
VITE_MOVERIS_WS_URI=wss://your-backend.com/api/liveliness
# No secret keys or credentials!
```

## 📝 Example Configurations

### Low Bandwidth Configuration
```env
VITE_FRAME_RATE=5
VITE_IMAGE_QUALITY=0.5
VITE_REQUIRED_FRAMES=500
```
- Processing time: ~100 seconds
- Lower data usage
- Good for mobile or slow connections

### Balanced Configuration (Recommended)
```env
VITE_FRAME_RATE=10
VITE_IMAGE_QUALITY=0.7
VITE_REQUIRED_FRAMES=500
```
- Processing time: ~50 seconds
- Good balance of speed and quality
- Recommended for most users

### Fast Configuration
```env
VITE_FRAME_RATE=15
VITE_IMAGE_QUALITY=0.7
VITE_REQUIRED_FRAMES=500
```
- Processing time: ~33 seconds
- Faster processing
- Requires good network connection

### High Quality Configuration
```env
VITE_FRAME_RATE=10
VITE_IMAGE_QUALITY=0.9
VITE_REQUIRED_FRAMES=500
```
- Processing time: ~50 seconds
- Better image quality
- Higher accuracy potential
- More bandwidth required

## 🧪 Testing Configuration

To test if environment variables are loaded correctly:

1. **Add debug logging** to App.jsx:
```javascript
console.log('Config loaded:', {
  wsUri: CONFIG.MOVERIS_WS_URI,
  secretKeySet: !!CONFIG.MOVERIS_SECRET_KEY,
  frameRate: CONFIG.FRAME_RATE,
  quality: CONFIG.IMAGE_QUALITY,
  requiredFrames: CONFIG.REQUIRED_FRAMES,
});
```

2. **Open browser console** (F12)
3. **Check output** - should show your configured values

## 🐛 Troubleshooting

### Problem: Variables not loading

**Solution 1:** Restart development server
```bash
# Stop server (Ctrl+C)
npm run dev
```

**Solution 2:** Check file name
- File must be named exactly `.env` (with the dot)
- Located in project root directory
- Not `.env.txt` or `env`

**Solution 3:** Check variable prefix
- All variables must start with `VITE_`
- Vite only exposes variables with this prefix
- Example: `VITE_MY_VAR=value`

### Problem: Secret key not working

**Checks:**
- [ ] Variable name is `VITE_MOVERIS_SECRET_KEY`
- [ ] No "Bearer" prefix in the value
- [ ] No extra spaces or quotes
- [ ] Server restarted after changing .env

### Problem: Variables undefined in code

**Solution:** Ensure you're accessing correctly:
```javascript
// ✓ Correct
import.meta.env.VITE_MY_VAR

// ✗ Incorrect
process.env.VITE_MY_VAR  // This is Node.js, not Vite
```

## 📚 Additional Resources

- [Vite Environment Variables Docs](https://vitejs.dev/guide/env-and-mode.html)
- [Moveris API Documentation](https://developers.moveris.com/docs)
- [Security Best Practices](../DEPLOYMENT.md#security)

## ⚠️ Important Reminders

1. **Never commit .env files** to version control
2. **Use different .env files** for different environments
3. **Store secrets on backend** in production
4. **Rotate secrets regularly**
5. **Use environment-specific configurations**
6. **Document all required variables** in .env.example

---

**Need help?** Check the main [README.md](../README.md) or [QUICKSTART.md](../QUICKSTART.md)