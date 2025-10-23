#!/bin/bash

# Moveris Authentication System - Automated Setup Script
# This script creates the complete project structure

echo "🚀 Setting up Moveris Authentication System..."

# Create project directory
PROJECT_DIR="moveris-auth-system"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

echo "📁 Creating directory structure..."
mkdir -p src public

echo "📝 Creating configuration files..."

# Create package.json
cat > package.json << 'EOF'
{
  "name": "moveris-liveliness-auth",
  "version": "1.0.0",
  "description": "React authentication system with Google OAuth and Moveris liveliness detection",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@react-oauth/google": "^0.12.1",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.1",
    "eslint-plugin-react": "^7.37.1",
    "eslint-plugin-react-hooks": "^4.6.2",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "vite": "^5.4.10"
  },
  "keywords": [
    "react",
    "authentication",
    "liveliness-detection",
    "google-oauth",
    "moveris",
    "biometric",
    "2fa",
    "security"
  ],
  "author": "Your Name",
  "license": "MIT"
}
EOF

# Create vite.config.js
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
EOF

# Create tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Create postcss.config.js
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# Dependencies
node_modules
dist
dist-ssr
*.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
build
dist
coverage
EOF

# Create .env.example
cat > .env.example << 'EOF'
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Moveris API Configuration
VITE_MOVERIS_WS_URI=wss://developers.moveris.com/ws/live/v1/
VITE_MOVERIS_AUTH_TOKEN=Bearer your_moveris_token_here

# Optional: Adjust timing settings (in milliseconds)
VITE_FRAME_CAPTURE_INTERVAL=500
VITE_LIVELINESS_DURATION=5000
EOF

# Create index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Secure authentication with Google OAuth and Moveris liveliness detection" />
    <title>Moveris Liveliness Authentication</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

# Create src/index.css
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOF

# Create src/main.jsx
cat > src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

echo "⚠️  IMPORTANT: You need to manually copy the App.jsx content from the artifacts"
echo "   The file is too large to include in this script."
echo ""
echo "📋 Create src/App.jsx and paste the content from the 'Moveris Liveliness Auth System' artifact"
echo ""

# Create placeholder App.jsx
cat > src/App.jsx << 'EOF'
// TODO: Replace this file with the complete App.jsx content from the artifact
// The artifact is titled "Moveris Liveliness Auth System"

import React from 'react';

const App = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>⚠️ Setup Required</h1>
      <p>Please replace this file with the complete App.jsx content from the artifact.</p>
      <p>Check the artifact titled "Moveris Liveliness Auth System"</p>
    </div>
  );
};

export default App;
EOF

# Create README files
echo "📚 Creating documentation..."

cat > README.md << 'EOF'
# Moveris Liveliness Authentication System

Please refer to the comprehensive README.md content from the artifacts.

## Quick Start

1. Copy the complete App.jsx from the artifact
2. Update credentials in src/App.jsx
3. Run: npm install
4. Run: npm run dev

For complete documentation, see the README.md artifact.
EOF

cat > QUICKSTART.md << 'EOF'
# Quick Start Guide

See the QUICKSTART.md artifact for complete quick start instructions.

## Basic Steps:
1. npm install
2. Update credentials in src/App.jsx
3. npm run dev
EOF

echo ""
echo "✅ Project structure created!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the complete App.jsx content from the 'Moveris Liveliness Auth System' artifact"
echo "2. Paste it into: src/App.jsx"
echo "3. Copy README.md content from the artifact"
echo "4. Copy QUICKSTART.md content from the artifact"
echo "5. Copy DEPLOYMENT.md content from the artifact"
echo "6. Run: npm install"
echo "7. Update your credentials in src/App.jsx (lines 24-27)"
echo "8. Run: npm run dev"
echo ""
echo "🎉 Happy coding!"