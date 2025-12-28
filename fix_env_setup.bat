@echo off
echo 🔧 Smart Crop Aid - Environment Setup Fix
echo ==========================================

echo.
echo 1. Checking if .env file exists...
if exist .env (
    echo ✅ .env file found
) else (
    echo ❌ .env file not found
    echo Copying from .env.example...
    copy .env.example .env
)

echo.
echo 2. Clearing Expo cache...
npx expo install --fix

echo.
echo 3. Restarting Expo with cleared cache...
echo This will reload all environment variables
echo.
echo Press any key to start Expo server...
pause > nul

npx expo start --clear