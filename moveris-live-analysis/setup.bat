@echo off
REM Moveris Authentication System - Windows Setup Script

echo Creating Moveris Authentication System...

set PROJECT_DIR=moveris-auth-system

REM Create directories
mkdir %PROJECT_DIR%
cd %PROJECT_DIR%
mkdir src
mkdir public

echo Creating configuration files...

REM Create package.json
(
echo {
echo   "name": "moveris-liveliness-auth",
echo   "version": "1.0.0",
echo   "description": "React authentication system with Google OAuth and Moveris liveliness detection",
echo   "type": "module",
echo   "scripts": {
echo     "dev": "vite",
echo     "build": "vite build",
echo     "preview": "vite preview"
echo   },
echo   "dependencies": {
echo     "react": "^18.3.1",
echo     "react-dom": "^18.3.1",
echo     "@react-oauth/google": "^0.12.1",
echo     "lucide-react": "^0.263.1"
echo   },
echo   "devDependencies": {
echo     "@vitejs/plugin-react": "^4.3.3",
echo     "autoprefixer": "^10.4.20",
echo     "postcss": "^8.4.47",
echo     "tailwindcss": "^3.4.14",
echo     "vite": "^5.4.10"
echo   }
echo }
) > package.json

REM Create index.html
(
echo ^<!DOCTYPE html^>
echo ^<html lang="en"^>
echo   ^<head^>
echo     ^<meta charset="UTF-8" /^>
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^>
echo     ^<title^>Moveris Liveliness Authentication^</title^>
echo   ^</head^>
echo   ^<body^>
echo     ^<div id="root"^>^</div^>
echo     ^<script type="module" src="/src/main.jsx"^>^</script^>
echo   ^</body^>
echo ^</html^>
) > index.html

REM Create basic files
echo. > src\App.jsx
echo. > src\main.jsx
echo. > src\index.css
echo. > vite.config.js
echo. > tailwind.config.js
echo. > README.md

echo.
echo ========================================
echo Project structure created!
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Manually copy all file contents from the Claude artifacts
echo 2. Paste them into the corresponding files
echo 3. Run: npm install
echo 4. Update credentials in src\App.jsx
echo 5. Run: npm run dev
echo.
echo Files to copy:
echo - src\App.jsx (from "Moveris Liveliness Auth System" artifact)
echo - src\main.jsx
echo - src\index.css
echo - index.html
echo - vite.config.js
echo - tailwind.config.js
echo - postcss.config.js
echo - README.md
echo - .gitignore
echo.
pause