# 🌾 Smart Crop Aid

> AI-Powered Agricultural Assistance Platform for Farmers

[![Expo](https://img.shields.io/badge/Expo-54.0.22-000020?logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?logo=react)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?logo=postgresql)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel)](https://vercel.com/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.17-FF6F00?logo=tensorflow)](https://tensorflow.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
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

## 📱 App Preview

<p align="center">
  <img src="assets/images/WhatsApp%20Image%202026-02-04%20at%208.21.01%20PM.jpeg" alt="Smart Crop Aid Login Screen" width="300">
</p>

<p align="center"><i>Smart Crop Advisory - Your Digital Farm Assistant</i></p>

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

## 📁 Project Structure

```
smart-crop-aid/
├── 📱 Frontend (React Native + Expo)
│   ├── app/              # Screens (Home, Pest Detection, Profile, etc.)
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React contexts (AuthContext)
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   ├── constants/        # App constants
│   └── assets/           # Images, fonts, icons
│
├── 🔧 Backend (Node.js + Express)
│   └── backend/
│       ├── routes/       # API routes (auth, pests, crops, etc.)
│       ├── utils/        # Backend utilities (emailService, etc.)
│       └── ...
│
├── 📚 Documentation
│   └── docs/
│       ├── deployment/   # Deployment guides (Vercel, APK build)
│       ├── security/     # Security documentation
│       ├── guides/       # Setup and troubleshooting guides
│       ├── technical/    # Architecture and analysis docs
│       └── references/   # Reference materials
│
├── 🛠️ Scripts
│   └── scripts/
│       ├── setup/        # Installation and environment setup
│       ├── database/     # Database utilities and migrations
│       ├── verification/ # Testing and verification scripts
│       ├── deployment/   # Deployment automation
│       └── utilities/    # Miscellaneous tools
│
└── ⚙️ Configuration
    ├── package.json      # Dependencies
    ├── tsconfig.json     # TypeScript config
    ├── app.json          # Expo config
    ├── eas.json          # EAS Build config
    ├── schema.sql        # Database schema
    └── .env              # Environment variables
```

---

## 🚀 Quick Start (Production)

**Option 1: Download Pre-built APK** (Recommended)
- See [📲 Download APK](#-download-apk) section below for direct installation

**Option 2: Run from Source**

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

## 📲 Download APK

**Pre-built APK available!** Skip the build process and install directly on your Android device.

### Download from GitHub Release ⭐

[![Download APK](https://img.shields.io/badge/Download-APK-success?style=for-the-badge&logo=android&logoColor=white)](https://github.com/moditejas2005/smart-crop-aid/releases/latest/download/Smart%20Crop%20Aid.apk)

**Latest Release**: [v1.0.0](https://github.com/moditejas2005/smart-crop-aid/releases/latest)

- **Size**: ~76 MB
- **Version**: 1.0.0
- **Build**: Production-ready with Vercel backend & HuggingFace ML API

> [!TIP]
> **Also available on [GitHub Store](https://github.com/rainxchzed/Github-Store)** 📱  
> Browse and install with one click using the GitHub Store app!

### Alternative Download Methods

<details>
<summary>Click to expand alternative download options</summary>

**Option 1: Direct Download Link**
- **Click here**: [Download Smart Crop Aid.apk](https://github.com/moditejas2005/smart-crop-aid/raw/main/APK/Smart%20Crop%20Aid.apk)
- Downloads directly to your device (mobile & desktop)

**Option 2: From APK Folder**
1. Navigate to the [`APK`](./APK) folder in this repository
2. Click on `Smart Crop Aid.apk`
3. Click the **Download** button (top right)

**Option 3: Clone Repository**
```bash
git clone https://github.com/moditejas2005/smart-crop-aid.git
cd smart-crop-aid/APK
# Transfer "Smart Crop Aid.apk" to your Android device
```

</details>

### Installation Steps

1. **Download** the APK file to your Android device using one of the methods above
2. **Enable Unknown Sources**:
   - Go to Settings → Security → Unknown Sources
   - Or when prompted, tap "Settings" → "Allow from this source"
3. **Install**: Tap the downloaded APK file and follow the prompts
4. **Open**: Launch Smart Crop Aid from your app drawer

### Test Credentials
- **Create a new farmer account** during first launch
- Or use the registration form to sign up

### Verify Installation
- ✅ Create a new farmer account
- ✅ Login successfully
- ✅ Test Pest Detection (camera/gallery upload)
- ✅ Check Crop Recommendations
- ✅ View Market Prices
- ✅ Check Weather widget

> [!NOTE]
> The APK is signed and ready for production use. All backend services are live and operational.
> 
> **Download not working?** Try Option 2 (Direct Download Link) or clone the repository (Option 3).

---

## �📱 Features & Verification

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

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Contribution Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**What this means:**
- ✅ Free to use for personal and commercial projects
- ✅ Modify and distribute as you wish
- ✅ No warranty or liability
- ⚠️ Must include original copyright notice

---

## 👨‍💻 Author

**Tejas Modi**
- GitHub: [@moditejas2005](https://github.com/moditejas2005)
- Email: tejasmodi666@gmail.com
- Project: [Smart Crop Aid](https://github.com/moditejas2005/smart-crop-aid)

---

<p align="center">
  Made with ❤️ for Farmers
</p>
