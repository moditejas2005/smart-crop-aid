@echo off
REM Smart Crop Aid - Dependency Installation Script (Windows)
REM This script installs all required dependencies including security packages

echo.
echo ========================================
echo Smart Crop Aid - Dependency Installation
echo ========================================
echo.

REM Install main dependencies
echo [1/3] Installing Node.js dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

REM Install Firebase SDK
echo.
echo [2/3] Installing Firebase SDK...
call npm install firebase
if errorlevel 1 (
    echo ERROR: Failed to install Firebase
    pause
    exit /b 1
)

REM Install additional security dependencies
echo.
echo [3/3] Installing security dependencies...
call npm install @react-native-async-storage/async-storage
if errorlevel 1 (
    echo ERROR: Failed to install security dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next Steps:
echo.
echo 1. Copy .env.example to .env
echo    copy .env.example .env
echo.
echo 2. Edit .env and fill in your credentials:
echo    - Firebase configuration
echo    - Bytez API key
echo    - Admin credentials
echo.
echo 3. Read SETUP_GUIDE.md for detailed instructions
echo.
echo 4. Start the development server:
echo    npm start
echo.
echo Documentation:
echo    - SETUP_GUIDE.md - Complete setup
echo    - SECURITY_FIXES.md - Security details
echo    - QUICK_REFERENCE.md - Code patterns
echo    - TODO_CHECKLIST.md - Task checklist
echo.
pause
