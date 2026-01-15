@echo off
echo ========================================
echo   Spotify Clone - Configuration Setup
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo ⚠️  Please edit .env and add your Spotify Client ID!
    echo.
    pause
    exit /b
)

echo ✅ .env file exists
echo.

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js found
    echo.
    echo Generating config.js from .env...
    node generate-config.js
    echo.
    echo ========================================
    echo   Setup Complete!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Make sure your Spotify app has these redirect URIs:
    echo    - http://localhost:5500/
    echo    - https://spotify-clone-using-api-vaishnav.vercel.app/
    echo.
    echo 2. Open index.html with Live Server or any local server
    echo.
) else (
    echo ⚠️  Node.js not found
    echo.
    echo config.js is already generated with default values.
    echo If you updated .env, you'll need Node.js to regenerate config.js
    echo.
    echo Or manually edit config.js to match your .env values.
    echo.
)

echo.
echo Ready to run! Open index.html in your browser.
echo.
pause
