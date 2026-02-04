# Smart Crop Aid - Complete Setup Guide

> Step-by-step guide to set up Smart Crop Aid on a new device after cloning from GitHub

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone Repository](#2-clone-repository)
3. [Database Setup](#3-database-setup)
4. [Backend Setup](#4-backend-setup)
5. [ML API Setup](#5-ml-api-setup)
6. [Frontend Setup](#6-frontend-setup)
7. [Environment Configuration](#7-environment-configuration)
8. [Running the Application](#8-running-the-application)
9. [Testing the Setup](#9-testing-the-setup)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 18.x or higher | [nodejs.org](https://nodejs.org/) |
| Python | 3.8 or higher | [python.org](https://python.org/) |
| MySQL | 8.0 or higher | [mysql.com](https://dev.mysql.com/downloads/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

### Mobile Development

| Tool | For | Download |
|------|-----|----------|
| Expo Go App | Testing on physical device | [App Store](https://apps.apple.com/app/expo-go/id982107779) / [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) |
| Android Studio | Android Emulator (optional) | [developer.android.com](https://developer.android.com/studio) |
| Xcode | iOS Simulator (Mac only) | App Store |

---

## 2. Clone Repository

```bash
# Clone from GitHub
git clone https://github.com/yourusername/smart-crop-aid.git

# Navigate to project directory
cd smart-crop-aid
```

---

## 3. Database Setup

### 3.1 Start MySQL Server

**Windows:**
```bash
# MySQL should start automatically with Windows
# Or start from Services app: services.msc
```

**macOS:**
```bash
brew services start mysql
```

**Linux:**
```bash
sudo systemctl start mysql
```

### 3.2 Create Database and Tables

```bash
# Login to MySQL
mysql -u root -p

# Enter your MySQL root password when prompted
```

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS smart_crop_aid;
USE smart_crop_aid;

-- Exit MySQL shell
EXIT;
```

```bash
# Import schema
mysql -u root -p smart_crop_aid < backend/schema.sql
```

### 3.3 Create Admin User (Optional)

```bash
# Run from project root
node create_test_user.js
```

Or manually via MySQL:
```sql
INSERT INTO users (id, email, password_hash, name, role) 
VALUES (UUID(), 'admin@test.com', '$2b$10$...', 'Admin User', 'admin');
```

---

## 4. Backend Setup

### 4.1 Install Dependencies

```bash
cd backend
npm install
```

### 4.2 Create Environment File

Create `backend/.env`:

```env
# Database Configuration
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/smart_crop_aid"
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=smart_crop_aid
DB_PORT=3306

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-key-change-this-in-production

# Server Port
PORT=3000
```

### 4.3 Test Database Connection

```bash
node -e "require('./db').execute('SELECT 1').then(() => console.log('✅ DB Connected!')).catch(e => console.error('❌ DB Error:', e.message))"
```

---

## 5. ML API Setup

### 5.1 Navigate to ML Directory

```bash
cd Plant-Disease-Recognition-System-main
```

### 5.2 Create Python Virtual Environment (Recommended)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 5.3 Install Python Dependencies

```bash
pip install flask flask-cors tensorflow pillow numpy
```

Or if `requirements.txt` exists:
```bash
pip install -r requirements.txt
```

### 5.4 Verify Model File

Ensure the model file exists:
```
Plant-Disease-Recognition-System-main/pest_detection_model_pwp.keras
```

> ⚠️ If the model file is missing (too large for Git), download it separately or contact the project maintainer.

---

## 6. Frontend Setup

### 6.1 Install Dependencies

```bash
# From project root
cd ..  # If you're in Plant-Disease-Recognition-System-main
npm install
```

### 6.2 Install Expo CLI (if not already installed)

```bash
npm install -g expo-cli
```

---

## 7. Environment Configuration

### 7.1 Create Root `.env` File

Create `.env` in project root:

```env
# Backend API URL (update with your machine's IP for physical devices)
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000/api

# Weather API Key (optional - get free from openweathermap.org)
EXPO_PUBLIC_WEATHER_API_KEY=your_api_key_here

# Flask ML API URL
EXPO_PUBLIC_ML_API_URL=http://YOUR_LOCAL_IP:5000/api
```

### 7.2 Find Your Local IP Address

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### 7.3 Update API URLs in Code

Update `utils/modelInference.ts` (line 2):
```typescript
const API_BASE_URL = 'http://YOUR_LOCAL_IP:5000/api';
```

Update `utils/api.ts` (lines 10-11):
```typescript
const DEV_API_URL = Platform.select({
  android: 'http://YOUR_LOCAL_IP:3000/api',
  ios: 'http://YOUR_LOCAL_IP:3000/api',
  default: 'http://localhost:3000/api',
});
```

---

## 8. Running the Application

### 8.1 Start All Services (3 Terminals)

**Terminal 1: Backend API**
```bash
cd backend
node server.js
```
Expected output:
```
🚀 Server running on http://localhost:3000
📱 Accessible on network at http://YOUR_IP:3000
✅ Connected to MySQL Database
✅ Checked crop_recommendations table
```

**Terminal 2: ML API**
```bash
cd Plant-Disease-Recognition-System-main
python api_server.py
```
Expected output:
```
✅ TensorFlow model loaded successfully
🚀 Flask server starting...
 * Running on http://0.0.0.0:5000
```

**Terminal 3: Expo App**
```bash
npx expo start
```
Expected output:
```
Starting Metro Bundler
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █ QR CODE HERE █ ▄▄▄▄▄ █
...
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
```

### 8.2 Run on Physical Device

1. Install **Expo Go** app on your phone
2. Ensure phone and computer are on the **same WiFi network**
3. Scan the QR code from Terminal 3 with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

---

## 9. Testing the Setup

### 9.1 Test Backend API

```bash
# Health check
curl http://localhost:3000/api/health

# Or in browser
http://localhost:3000/api/admin/stats
```

### 9.2 Test ML API

```bash
# Health check
curl http://localhost:5000/api/health

# Get available classes
curl http://localhost:5000/api/classes
```

### 9.3 Test in App

1. Open app on device/emulator
2. Register a new account
3. Navigate to **Pest Detection**
4. Upload a crop leaf image
5. Verify AI analysis returns results

---

## 10. Troubleshooting

### Common Issues

#### "Network request failed"
- Ensure backend is running on port 3000
- Check that your device and computer are on same network
- Update API URLs with correct IP address
- Check firewall settings

#### "Flask API server not available"
- Ensure Python ML server is running
- Check TensorFlow is installed correctly
- Verify model file exists

#### "Access denied for user"
- Check MySQL credentials in `.env`
- Verify MySQL server is running
- Ensure user has proper permissions

#### "Module not found"
```bash
# Frontend
npm install

# Backend
cd backend && npm install

# ML API
pip install -r requirements.txt
```

#### "Port already in use"
**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -i :3000
kill -9 <PID>
```

#### Expo package warnings
```bash
npx expo install --fix
```

---

## Quick Reference Commands

```bash
# Start everything (run each in separate terminal)
cd backend && node server.js
cd Plant-Disease-Recognition-System-main && python api_server.py
npx expo start

# Reset database
mysql -u root -p smart_crop_aid < backend/schema.sql

# Update dependencies
npm install
cd backend && npm install

# Clear Expo cache
npx expo start --clear
```

---

## Support

If you encounter issues not covered here:

1. Check the [AUDIT.md](./AUDIT.md) for technical details
2. Review server logs for error messages
3. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Your OS and Node/Python versions

---

<p align="center">
Happy Farming! 🌾
</p>
