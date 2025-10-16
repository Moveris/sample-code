# Deployment Guide

This guide covers deploying the Moveris Liveliness Authentication system to various platforms.

## ⚠️ Security Notice

**CRITICAL**: Never expose Moveris authentication tokens in frontend code in production. This example is for development and reference purposes. For production:

1. Create a backend API service
2. Store Moveris credentials server-side
3. Proxy WebSocket connections through your backend
4. Implement proper authentication and rate limiting

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Configure environment variables**
Create `.env.production` or add in Vercel dashboard:
```
VITE_GOOGLE_CLIENT_ID=your_production_google_client_id
VITE_MOVERIS_WS_URI=wss://developers.moveris.com/ws/live/v1/
VITE_MOVERIS_AUTH_TOKEN=Bearer your_token
```

4. **Deploy**
```bash
vercel --prod
```

5. **Update Google OAuth settings**
- Add your Vercel domain to authorized JavaScript origins
- Add your Vercel domain to authorized redirect URIs

### Option 2: Netlify

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Build the project**
```bash
npm run build
```

3. **Deploy**
```bash
netlify deploy --prod
```

4. **Set environment variables** in Netlify dashboard:
- Go to Site settings → Build & deploy → Environment
- Add your environment variables

5. **Configure redirects** (create `public/_redirects`):
```
/*    /index.html   200
```

### Option 3: GitHub Pages

1. **Install gh-pages**
```bash
npm install --save-dev gh-pages
```

2. **Update package.json**
```json
{
  "homepage": "https://yourusername.github.io/moveris-auth",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. **Update vite.config.js**
```javascript
export default defineConfig({
  base: '/moveris-auth/',
  // ... rest of config
})
```

4. **Deploy**
```bash
npm run deploy
```

### Option 4: Docker

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **Create nginx.conf**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. **Build and run**
```bash
docker build -t moveris-auth .
docker run -p 80:80 moveris-auth
```

## 🔒 Production Backend Example

For production, create a backend service to proxy Moveris WebSocket:

### Node.js/Express Backend

```javascript
// server.js
const express = require('express');
const expressWs = require('express-ws');
const WebSocket = require('ws');

const app = express();
expressWs(app);

app.ws('/api/liveliness', (ws, req) => {
  // Verify user authentication first
  const userId = req.session?.userId;
  if (!userId) {
    ws.close(1008, 'Unauthorized');
    return;
  }

  // Create WebSocket connection to Moveris
  const moverisWs = new WebSocket('wss://developers.moveris.com/ws/live/v1/');
  
  moverisWs.on('open', () => {
    console.log('Connected to Moveris');
  });

  moverisWs.on('message', (data) => {
    const message = JSON.parse(data.toString());
    
    // Handle initial connection
    if (message.type !== 'auth_success') {
      // Authenticate with Moveris using server-side token
      moverisWs.send(JSON.stringify({
        type: 'auth',
        token: process.env.MOVERIS_AUTH_TOKEN
      }));
    } else {
      // Forward Moveris responses to client
      ws.send(data.toString());
    }
  });

  // Forward client frames to Moveris
  ws.on('message', (data) => {
    if (moverisWs.readyState === WebSocket.OPEN) {
      moverisWs.send(data.toString());
    }
  });

  // Handle disconnections
  ws.on('close', () => {
    moverisWs.close();
  });

  moverisWs.on('close', () => {
    ws.close();
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Update Frontend to Use Backend Proxy

```javascript
// In App.jsx, update WebSocket URL
const CONFIG = {
  // ... other config
  MOVERIS_WS_URI: window.location.protocol === 'https:' 
    ? 'wss://your-domain.com/api/liveliness'
    : 'ws://localhost:3000/api/liveliness',
  // Remove MOVERIS_AUTH_TOKEN - handled by backend
};
```

## 📊 Environment Variables by Platform

### Vercel
- Set in dashboard: Settings → Environment Variables
- Or use `vercel env add`

### Netlify
- Set in dashboard: Site settings → Build & deploy → Environment
- Or use `netlify env:set`

### AWS Amplify
- Set in dashboard: App settings → Environment variables

### Heroku
```bash
heroku config:set VITE_GOOGLE_CLIENT_ID=your_id
```

## 🔍 Post-Deployment Checklist

- [ ] Update Google OAuth authorized origins and redirect URIs
- [ ] Verify environment variables are set correctly
- [ ] Test Google login flow
- [ ] Test webcam permissions (must be HTTPS)
- [ ] Test Moveris WebSocket connection
- [ ] Verify error handling works correctly
- [ ] Test on mobile devices
- [ ] Check browser console for errors
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Add analytics if needed

## 🐛 Common Deployment Issues

### Issue: Google Login Not Working
**Solution**: Add production domain to Google OAuth authorized origins

### Issue: Webcam Not Accessible
**Solution**: Ensure site is served over HTTPS (not HTTP)

### Issue: WebSocket Connection Fails
**Solution**: Check firewall/security group settings, verify WSS (not WS) in production

### Issue: CORS Errors
**Solution**: Configure proper CORS headers on your backend

### Issue: Environment Variables Not Loading
**Solution**: Ensure variable names start with `VITE_` and rebuild after changes

## 📈 Monitoring

### Recommended Tools
- **Sentry**: Error tracking and monitoring
- **LogRocket**: Session replay and debugging
- **Google Analytics**: Usage analytics
- **Datadog**: Infrastructure monitoring

### Key Metrics to Track
- Google login success rate
- Liveliness detection success rate
- Average detection time
- WebSocket connection failures
- Webcam access denials

## 🔐 Security Hardening

1. **Content Security Policy**
Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               connect-src 'self' https://accounts.google.com wss://developers.moveris.com;
               img-src 'self' data: https:;
               script-src 'self' https://accounts.google.com;">
```

2. **Rate Limiting**
Implement on backend to prevent abuse

3. **Input Validation**
Validate all user inputs and API responses

4. **Regular Updates**
Keep dependencies updated:
```bash
npm audit
npm update
```

## 📞 Support

For deployment issues:
- Check application logs
- Review browser console
- Verify environment variables
- Test API endpoints independently

For platform-specific issues:
- Vercel: https://vercel.com/support
- Netlify: https://www.netlify.com/support
- AWS: https://aws.amazon.com/support

---

**Remember**: Always test thoroughly in a staging environment before deploying to production!

