# Smart Crop Aid - Steps to Production Readiness (FREE Alternatives)

> **Complete Guide to Making the System Ready for Real-Time APK Use**  
> **Date:** December 28, 2024  
> **Estimated Total Time:** 8-16 hours  
> **💰 Total Cost: $0/month (100% FREE)**

---

## 📋 Overview Checklist

| # | Phase | Estimated Time | Priority | Cost |
|---|-------|----------------|----------|------|
| 1 | [Cloud Database Setup](#phase-1-cloud-database-setup) | 1-2 hours | 🔴 Critical | FREE |
| 2 | [Backend Deployment](#phase-2-backend-deployment) | 2-3 hours | 🔴 Critical | FREE |
| 3 | [ML API Deployment](#phase-3-ml-api-deployment) | 2-3 hours | 🔴 Critical | FREE |
| 4 | [Frontend Configuration](#phase-4-frontend-configuration) | 1-2 hours | 🔴 Critical | FREE |
| 5 | [Security Hardening](#phase-5-security-hardening) | 1-2 hours | 🟡 High | FREE |
| 6 | [APK Build & Test](#phase-6-apk-build--test) | 1-2 hours | 🔴 Critical | FREE |
| 7 | [Production Launch](#phase-7-production-launch) | 1-2 hours | 🟡 High | FREE |

---

## 🆓 FREE Services Summary

| Component | Recommended Service | Free Tier Limits |
|-----------|--------------------|--------------------|
| **Database** | Neon (PostgreSQL) | 0.5GB storage, 3GB data transfer |
| **Backend API** | Render | 750 hours/month, auto-sleep |
| **ML API** | Hugging Face Spaces | Unlimited, 2 vCPU, 16GB RAM |
| **File Storage** | Cloudinary | 25GB storage, 25GB bandwidth |
| **APK Build** | EAS (Expo) | 30 builds/month |

---

## Phase 1: Cloud Database Setup (FREE)

### Step 1.1: FREE Database Options

| Provider | Free Tier | Limits | Recommended |
|----------|-----------|--------|-------------|
| **Neon** ⭐ | ✅ Forever Free | 0.5GB storage, 3GB transfer | ✅ Best for small apps |
| **Supabase** | ✅ Forever Free | 500MB storage, 2GB transfer | ✅ Good alternative |
| **PlanetScale** | ❌ Removed free tier | N/A | ❌ No longer free |
| **CockroachDB** | ✅ Forever Free | 10GB storage | ✅ Good for scale |
| **ElephantSQL** | ✅ Forever Free | 20MB storage | ⚠️ Very limited |

### Step 1.2: Neon Setup (Recommended - 100% FREE)

```bash
# 1. Go to https://neon.tech and create FREE account
# 2. Create new project: "smart-crop-aid"
# 3. Select region: "Asia Pacific (Singapore)" or closest to your users
# 4. Copy connection string from dashboard
#    Format: postgres://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/smart_crop_aid?sslmode=require
```

> ⚠️ **Note:** Neon uses PostgreSQL, not MySQL. You'll need minor schema changes (see Step 1.3).

### Step 1.3: Create Database Schema (PostgreSQL Version)

Run the following SQL on Neon console:

```sql
-- PostgreSQL Schema for Smart Crop Aid
-- NOTE: This is converted from MySQL to PostgreSQL syntax

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin')),
    is_banned BOOLEAN DEFAULT FALSE,
    location VARCHAR(255),
    farm_size DECIMAL(10, 2),
    farm_lat DECIMAL(10, 8),
    farm_lng DECIMAL(11, 8),
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crops Table
CREATE TABLE IF NOT EXISTS crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    planting_date DATE,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    status VARCHAR(20) DEFAULT 'planted' CHECK (status IN ('recommended', 'planted', 'growing', 'harvested', 'failed')),
    area DECIMAL(10, 2),
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    soil_type VARCHAR(100),
    irrigation_type VARCHAR(100),
    notes TEXT,
    yield_amount DECIMAL(10, 2),
    yield_unit VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pest Reports Table
CREATE TABLE IF NOT EXISTS pest_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    pest_name VARCHAR(100),
    confidence DECIMAL(5, 2),
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    ai_analysis TEXT,
    treatment_recommended TEXT,
    treatment_applied TEXT,
    treatment_status VARCHAR(20) DEFAULT 'pending' CHECK (treatment_status IN ('pending', 'in_progress', 'completed')),
    cause TEXT,
    prevention TEXT,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crop Recommendations Table
CREATE TABLE IF NOT EXISTS crop_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    soil_type VARCHAR(50) NOT NULL,
    water_level VARCHAR(20) NOT NULL,
    season VARCHAR(20) NOT NULL,
    recommendations_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market Prices Table
CREATE TABLE IF NOT EXISTS market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    market_name VARCHAR(100),
    location VARCHAR(255),
    region VARCHAR(100),
    date DATE NOT NULL,
    trend VARCHAR(10) CHECK (trend IN ('up', 'down', 'stable')),
    change_percentage DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('weather', 'pest', 'price', 'crop', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_crops_user_id ON crops(user_id);
CREATE INDEX idx_pest_reports_user_id ON pest_reports(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

### Step 1.4: Update Backend for PostgreSQL

Since we're switching to PostgreSQL, update the backend database driver:

```bash
cd backend
npm uninstall mysql2
npm install pg
```

### Step 1.5: Update Backend Configuration

Create/update `backend/.env` for production:

```env
# Production Database Configuration (Neon PostgreSQL)
DATABASE_URL="postgres://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/smart_crop_aid?sslmode=require"

# Server Configuration  
PORT=3000
NODE_ENV=production
JWT_SECRET=generate_a_32_char_random_string_here
```

### Step 1.6: Update db.js for PostgreSQL

```javascript
// backend/db.js - UPDATED VERSION FOR POSTGRESQL
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000
});

// Test connection
pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL (Neon)');
    client.release();
  })
  .catch(err => console.error('❌ Database connection failed:', err.message));

module.exports = pool;
```

### Step 1.7: Update SQL Queries in Routes

PostgreSQL uses `$1, $2, $3` placeholders instead of `?`. Update your routes:

```javascript
// Example: backend/routes/auth.js
// BEFORE (MySQL):
// const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

// AFTER (PostgreSQL):
const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
const users = result.rows;
```

---

## Phase 2: Backend Deployment (FREE)

### Step 2.1: FREE Hosting Options

| Provider | Free Tier | Limits | Recommended |
|----------|-----------|--------|-------------|
| **Render** ⭐ | ✅ Forever Free | 750 hours/month, auto-sleep after 15 min | ✅ Best for starting |
| **Fly.io** | ✅ Forever Free | 3 VMs, 256MB RAM each | ✅ Good alternative |
| **Cyclic.sh** | ✅ Forever Free | 100k requests/month | ✅ No cold starts |
| **Railway** | ❌ $5 credit only | Runs out | ⚠️ Not truly free |
| **Vercel** | ✅ Forever Free | Serverless only | ⚠️ Need code changes |

### Step 2.2: Prepare Backend for Deployment

#### 2.2.1 Update package.json

```json
{
  "name": "smart-crop-aid-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### 2.2.2 Create Procfile (for Heroku/Railway)

```
web: node server.js
```

#### 2.2.3 Update server.js for Production

```javascript
// backend/server.js - Add these changes
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');  // ADD THIS
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS - Restrict in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-app-domain.com'] 
    : '*',
  credentials: true
};
app.use(cors(corsOptions));

// Logging - Less verbose in production
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/pests', require('./routes/pests'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/market-prices', require('./routes/market'));
app.use('/api/recommendations', require('./routes/recommendations'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve uploaded files (use cloud storage in production)
app.use('/uploads', express.static('uploads'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Step 2.3: Deploy to Render (100% FREE - Recommended)

```bash
# Method 1: Deploy via Dashboard (Easier)
# 1. Go to https://render.com and sign up FREE
# 2. Click "New" → "Web Service"
# 3. Connect your GitHub repo (or use public URL)
# 4. Configure:
#    - Name: smart-crop-aid-api
#    - Region: Singapore (or closest)
#    - Branch: main
#    - Root Directory: backend
#    - Runtime: Node
#    - Build Command: npm install
#    - Start Command: node server.js
#    - Instance Type: Free
# 5. Add Environment Variables:
#    - DATABASE_URL = your_neon_connection_string
#    - JWT_SECRET = your_32_char_secret
#    - NODE_ENV = production
# 6. Click "Create Web Service"
# 7. Wait for deployment (~5-10 minutes)
# 8. Your URL: https://smart-crop-aid-api.onrender.com
```

> ⚠️ **Note:** Render free tier sleeps after 15 min of inactivity. First request after sleep takes ~30 seconds. This is acceptable for small apps.

### Step 2.4: Alternative - Deploy to Cyclic.sh (No Cold Starts)

```bash
# 1. Go to https://cyclic.sh
# 2. Sign in with GitHub
# 3. Deploy from GitHub repo
# 4. Add environment variables
# 5. Your URL: https://smart-crop-aid.cyclic.app
```

### Step 2.5: Verify Deployment

```bash
# Test health endpoint
curl https://smart-crop-aid-api.onrender.com/health

# Expected response:
# {"status":"healthy","timestamp":"2024-12-28T..."}
```

---

## Phase 3: ML API Deployment (100% FREE)

### Step 3.1: FREE ML Hosting Options

| Option | Free Tier | RAM | Cold Start | Recommended |
|--------|-----------|-----|------------|-------------|
| **Hugging Face Spaces** ⭐ | ✅ Forever Free | 16GB | ~30 sec | ✅ Best for ML |
| **Render** | ⚠️ Limited | 512MB | ~30 sec | ❌ Too small for TF |
| **Railway** | ❌ $5 credit | 512MB | No | ❌ Not free |
| **Google Cloud Run** | ⚠️ Always Free cap | 2GB | ~10 sec | ⚠️ Complex setup |

### Step 3.2: Deploy on Hugging Face Spaces (RECOMMENDED - 100% FREE)

#### 3.2.1 Create Hugging Face Account

```bash
# 1. Go to https://huggingface.co and sign up FREE
# 2. Go to https://huggingface.co/spaces
# 3. Click "Create new Space"
# 4. Configure:
#    - Space name: smart-crop-aid-ml
#    - License: Apache 2.0
#    - SDK: Docker
#    - Hardware: CPU basic (FREE) - 2 vCPU, 16GB RAM
```

#### 3.2.2 Create Space Files

Create these files in your Hugging Face Space:

**requirements.txt:**
```txt
flask==2.3.3
flask-cors==4.0.0
tensorflow-cpu==2.15.0
Pillow==10.1.0
numpy==1.24.3
gunicorn==21.2.0
```

**Dockerfile:**
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and model
COPY . .

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Run with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--timeout", "120", "--workers", "1", "api_server:app"]
```

**api_server.py (updated):**
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import json
import uuid
import tensorflow as tf
import base64
import io
from PIL import Image
import os

app = Flask(__name__)
CORS(app)  # Allow all origins for API access

# Load the trained model
model = tf.keras.models.load_model("models/pest_detection_model_pwp.keras", compile=False)

# Class labels
label = ['Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
         'Background_without_leaves', 'Blueberry___healthy', 'Cherry___Powdery_mildew', 'Cherry___healthy',
         'Corn___Cercospora_leaf_spot Gray_leaf_spot', 'Corn___Common_rust', 'Corn___Northern_Leaf_Blight',
         'Corn___healthy', 'Grape___Black_rot', 'Grape___Esca_(Black_Measles)',
         'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
         'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy',
         'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Potato___Early_blight',
         'Potato___Late_blight', 'Potato___healthy', 'Raspberry___healthy', 'Soybean___healthy',
         'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy',
         'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight',
         'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot',
         'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot',
         'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy']

# Load disease info
try:
    with open("plant_disease.json", 'r') as f:
        plant_disease = json.load(f)
except:
    plant_disease = {}

def extract_features(pil_image):
    image = pil_image.resize((160, 160))
    feature = tf.keras.utils.img_to_array(image)
    feature = np.array([feature]) / 255.0
    return feature

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'model_loaded': model is not None, 'classes': len(label)})

@app.route('/api/predict', methods=['POST'])
def predict_api():
    try:
        if not request.is_json or 'imageBase64' not in request.json:
            return jsonify({'error': 'No image provided'}), 400
        
        image_data = request.json['imageBase64']
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        pil_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        img = extract_features(pil_image)
        prediction = model.predict(img)
        
        predicted_class_index = prediction.argmax()
        confidence = float(prediction.max())
        predicted_label = label[predicted_class_index]
        
        return jsonify({
            'success': True,
            'prediction': {
                'pestName': predicted_label,
                'confidence': round(confidence * 100, 2),
                'affectedCrop': predicted_label.split('___')[0].replace(',_', ' '),
                'classIndex': int(predicted_class_index)
            },
            'timestamp': str(uuid.uuid4())
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/classes', methods=['GET'])
def get_classes():
    return jsonify({'classes': label, 'total': len(label)})

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Plant Disease Detection API', 'version': '1.0.0'})

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 7860))
    app.run(host='0.0.0.0', port=port)
```

#### 3.2.3 Upload Model to Hugging Face

```bash
# Option 1: Upload via web interface
# - Go to your Space's "Files" tab
# - Create "models" folder
# - Upload pest_detection_model_pwp.keras (203MB)

# Option 2: Use Git LFS
git lfs install
git clone https://huggingface.co/spaces/YOUR_USERNAME/smart-crop-aid-ml
cd smart-crop-aid-ml
mkdir models
cp /path/to/pest_detection_model_pwp.keras models/
git add .
git commit -m "Add ML model"
git push
```

#### 3.2.4 Your ML API URL

After deployment, your API will be available at:
```
https://YOUR_USERNAME-smart-crop-aid-ml.hf.space
```

### Step 3.3: Verify ML API

```bash
# Test health endpoint
curl https://YOUR_USERNAME-smart-crop-aid-ml.hf.space/api/health

# Expected response:
# {"status":"healthy","model_loaded":true,"classes":38}
```

---

## Phase 4: Frontend Configuration

### Step 4.1: Update Environment Variables

Create `.env` in project root (not in git):

```env
# Production API URLs
EXPO_PUBLIC_API_URL=https://your-backend.railway.app/api
EXPO_PUBLIC_ML_API_URL=https://your-ml-api.render.com

# Weather API (if using)
EXPO_PUBLIC_WEATHER_API_KEY=your_openweathermap_key
```

### Step 4.2: Update utils/api.ts

```typescript
// utils/api.ts - UPDATED VERSION
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use environment variable for production
const PROD_API_URL = process.env.EXPO_PUBLIC_API_URL;

// Fallback for development only
const DEV_API_URL = Platform.select({
  android: 'http://10.0.2.2:3000/api',  // Android emulator
  ios: 'http://localhost:3000/api',
  default: 'http://localhost:3000/api',
});

export const API_BASE_URL = PROD_API_URL || DEV_API_URL;

// Rest of the file remains the same...
```

### Step 4.3: Update utils/modelInference.ts

```typescript
// utils/modelInference.ts - UPDATED VERSION

// Use environment variable for production
const PROD_API_URL = process.env.EXPO_PUBLIC_ML_API_URL;
const DEV_API_URL = 'http://localhost:5000';

const API_BASE_URL = PROD_API_URL || DEV_API_URL;

const API_ENDPOINTS = {
  health: '/api/health',
  predict: '/api/predict',
  classes: '/api/classes',
  diseaseInfo: '/api/disease-info'
};

// Rest of the file remains the same...
```

### Step 4.4: Create EAS Build Configuration

Create `eas.json` in project root:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Step 4.5: Update app.json for Production

```json
{
  "expo": {
    "name": "Smart Crop Aid",
    "slug": "smart-crop-aid",
    "version": "1.0.0",
    "android": {
      "package": "com.yourcompany.smartcropaid",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#32CD32"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "INTERNET"
      ]
    },
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

---

## Phase 5: Security Hardening

### Step 5.1: Generate Strong JWT Secret

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Use this as JWT_SECRET in your environment variables
```

### Step 5.2: Add Rate Limiting

```bash
# Install rate limiter
cd backend
npm install express-rate-limit
```

```javascript
// backend/server.js - Add rate limiting
const rateLimit = require('express-rate-limit');

// Rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many login attempts, try again later' }
});

// Apply to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// General rate limit
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // 100 requests per minute
});

app.use('/api/', generalLimiter);
```

### Step 5.3: Add Helmet Security Headers

```bash
npm install helmet
```

```javascript
// backend/server.js
const helmet = require('helmet');
app.use(helmet());
```

### Step 5.4: Restrict CORS for Production

```javascript
// backend/server.js
const corsOptions = {
  origin: [
    'https://your-frontend-domain.com',
    'exp://your-expo-url' // For development
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

### Step 5.5: Remove Console.log Statements

```bash
# Search and remove or replace with proper logging
# Consider using winston or pino for production logging

npm install winston
```

---

## Phase 6: APK Build & Test

### Step 6.1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 6.2: Login to Expo

```bash
eas login
```

### Step 6.3: Configure EAS

```bash
eas build:configure
```

### Step 6.4: Build Preview APK

```bash
# Build APK for testing (side-loading)
eas build --platform android --profile preview
```

### Step 6.5: Download and Test APK

1. Download APK from EAS dashboard
2. Install on physical Android device (enable "Unknown Sources")
3. Test all features:
   - [ ] Login/Register
   - [ ] Pest detection with camera
   - [ ] Pest detection with gallery
   - [ ] Crop recommendations
   - [ ] Market prices
   - [ ] Profile update
   - [ ] Admin dashboard (if admin user)

### Step 6.6: Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Network request failed | Verify API URLs in .env |
| SSL certificate error | Use HTTPS URLs only |
| App crashes on start | Check logcat for errors |
| Image upload fails | Verify backend CORS settings |
| Slow ML predictions | Check ML API hosting tier |

---

## Phase 7: Production Launch

### Step 7.1: Build Production AAB

```bash
# Build Android App Bundle for Play Store
eas build --platform android --profile production
```

### Step 7.2: Google Play Console Setup

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Fill in app details:
   - App name: Smart Crop Aid
   - Category: Tools or Productivity
   - Content rating: Complete questionnaire
4. Upload AAB file
5. Create store listing with screenshots
6. Submit for review

### Step 7.3: Pre-Launch Checklist

- [ ] All environment variables set in production
- [ ] Database backups configured
- [ ] SSL certificates valid
- [ ] Error monitoring set up (Sentry recommended)
- [ ] Analytics configured (optional)
- [ ] Privacy policy URL ready
- [ ] Terms of service URL ready

### Step 7.4: Monitoring Setup (Recommended)

```bash
# Install Sentry for error tracking
npm install @sentry/react-native

# Configure in app
```

---

## Quick Reference: Production URLs

After completing all steps, you should have:

| Service | URL Example |
|---------|-------------|
| Backend API | https://smart-crop-aid-api.up.railway.app |
| ML API | https://smart-crop-ml.onrender.com |
| Database | smart-crop-aid-db.planetscale.com |
| APK Download | https://expo.dev/@yourname/smart-crop-aid |

---

## 💰 Estimated Costs (Monthly) - 100% FREE!

| Service | Provider | Cost | Limits |
|---------|----------|------|--------|
| Database | Neon | **$0** | 0.5GB storage |
| Backend API | Render | **$0** | 750 hrs/month |
| ML API | Hugging Face | **$0** | Unlimited |
| File Storage | Cloudinary | **$0** | 25GB storage |
| APK Build | EAS (Expo) | **$0** | 30 builds/month |
| **TOTAL** | - | **$0/month** | Perfect for small apps |

### When to Upgrade to Paid?

- **100+ daily active users**: Consider Render paid ($7/month) to avoid cold starts
- **1000+ pest detections/month**: Consider dedicated ML hosting
- **5GB+ database**: Upgrade Neon ($19/month)

---

## 📚 Support & Resources

- [Expo Documentation](https://docs.expo.dev)
- [Neon Documentation](https://neon.tech/docs)
- [Render Documentation](https://render.com/docs)
- [Hugging Face Spaces](https://huggingface.co/docs/hub/spaces)

---

## ✅ Quick Summary

| Step | Service | URL After Setup |
|------|---------|------------------|
| 1. Database | Neon | `postgres://...@neon.tech/smart_crop_aid` |
| 2. Backend | Render | `https://smart-crop-aid-api.onrender.com` |
| 3. ML API | Hugging Face | `https://username-smart-crop-aid-ml.hf.space` |
| 4. APK | EAS | Download from Expo dashboard |

**Total Time:** 8-16 hours  
**Total Cost:** $0/month  

---

**End of Production Readiness Guide (FREE Alternatives)**
