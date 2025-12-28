# 🌾 Smart Crop Aid

> AI-Powered Agricultural Assistance Platform for Farmers

[![Expo](https://img.shields.io/badge/Expo-54.0.22-000020?logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?logo=react)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?logo=postgresql)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel)](https://vercel.com/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.17-FF6F00?logo=tensorflow)](https://tensorflow.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Overview

**Smart Crop Aid** is a comprehensive mobile application that empowers farmers with AI-driven tools for:

| Feature | Description |
|---------|-------------|
| 🔬 **Pest & Disease Detection** | Upload crop leaf images for instant AI analysis using a trained Keras model (38 disease classes) |
| 🌱 **Crop Recommendations** | Get personalized crop suggestions based on soil type, water availability, and season |
| 📊 **Market Prices** | Track real-time agricultural commodity prices |
| 🌤️ **Weather Integration** | Location-based weather data for informed farming decisions |
| 💬 **Kisan Help Center** | FAQ system with farming tips and guidance |
| 👨‍💼 **Admin Dashboard** | Manage users, view reports, and monitor system activity |

---

## 🏗️ Production Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    MOBILE APP (Expo)                        │
│             React Native + TypeScript (Android APK)         │
└─────────────────────────┬──────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌─────────────┐ ┌────────────────┐
│  Vercel (Node)  │ │ HuggingFace │ │ Weather API    │
│  Backend API    │ │ Flask ML    │ │ (OpenWeather)  │
└────────┬────────┘ └─────┬───────┘ └────────────────┘
         │                │
         ▼                ▼
┌─────────────────┐  ┌────────────┐
│  Neon (Postgres)│  │ Cloudinary │
│  Database       │  │ Images     │
└─────────────────┘  └────────────┘
```

---

## 🚀 Quick Start (Production)

To run this project, you just need the **Mobile App** since the Backend and ML API are deployed.

### 1. Backend & AI Status
*   **Backend**: `https://smart-crop-aid.vercel.app` (Online ✅)
*   **ML API**: `https://tejasmodi05-smart-crop-aid-ml.hf.space` (Online ✅)
*   **Database**: Neon PostgreSQL (Online ✅)

### 2. Run the App
```bash
# Install dependencies
npm install

# Start the Expo Go server
npx expo start
```

### 3. Build APK
```bash
# Login to Expo
eas login

# Build for Android
eas build --platform android --profile preview
```

---

## 📱 Features & Verification

### For Farmers

| Screen | Features | Implementation |
|--------|----------|----------------|
| **Home** | Weather widget, quick actions | OpenWeatherMap API |
| **Pest Detection** | **Camera/Gallery Upload** | Cloudinary + Hugging Face ML |
| **Crop Recommendation** | Soil/water/season selection | PostgreSQL Query Logic |
| **Market Prices** | Commodity search, trends | PostgreSQL Data |
| **Profile** | Account settings | PostgreSQL User Table |

### For Administrators

| Screen | Features | Access |
|--------|----------|--------|
| **Dashboard** | System stats | Admin Role Only |
| **User Management** | Ban/unban functionality | Admin Role Only |
| **Reports & Prices** | Manage system data | Admin Role Only |

---

## 🔧 API Endpoints

### Backend API (Vercel)
**Base URL**: `https://smart-crop-aid.vercel.app/api`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User authentication |
| `/pests` | POST | Create pest report (Uploads to Cloudinary) |
| `/admin/stats` | GET | Admin Dashboard Stats |

### ML API (Hugging Face)
**Base URL**: `https://tejasmodi05-smart-crop-aid-ml.hf.space/api`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Check Status (`model_loaded: true`) |
| `/predict` | POST | Analyze Image |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for Farmers
</p>
