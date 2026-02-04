# 📱 APK Build Guide: Production Ready

> **Status:** GREEN LIGHT 🟢
> **Verified On:** Dec 28, 2024
> **Configuration:** Stable Expo SDK 52 + Vercel Backend

---

## ✅ Verified Prerequisites (We fixed these!)
Before you build, know that we have already fixed the following:
1.  **App Icon**: Converted to PNG (Android compatible).
2.  **Configuration**: Removed invalid `newArchEnabled` and Android settings from `app.json`.
3.  **Dependencies**: Installed `expo-camera`, `expo-gl`, and fixed all version mismatches.
4.  **Backend**: Connected to Vercel (Online).

---

## 🏗️ Step-by-Step Build Instructions

### 1. Open Terminal
Ensure you are in the project folder: `e:\Tejas\Mini-Projects 1\smart-crop-aid`

### 2. Login to Expo
(If you are not already logged in)
```bash
eas login
```

### 3. Start the Build 🚀
Run this **exact** command to generate the APK:
```bash
eas build --platform android --profile preview
```

### 4. During the Build
*   **Keystore Prompt**: If asked *"Generate a new Android Keystore?"*, type **Y** and hit Enter.
*   **Wait Time**: It will take **15-20 minutes** (Free Tier queue).
*   **Don't Close**: Keep the terminal open until you see the **Success** message.

---

## 📲 How to Install the APK

When the build finishes, you will see a link like:
`https://expo.dev/artifacts/eas/.../app-preview.apk`

1.  **Download**: Click the link to download the `.apk` file to your computer.
2.  **Transfer**: Send it to your phone (USB, WhatsApp, Google Drive).
3.  **Install on Phone**:
    *   Tap the file on your phone.
    *   **Security Warning**: If it says *"Install unknown apps"*, click **Settings** -> **Allow from this source**.
    *   Tap **Install**.

---

## 🧪 Verification Checklist (On Phone)

Once the app is open:

- [ ] **Login**: Use `admin@smartcrop.com` / `admin@123` (or create a new user).
- [ ] **Pest Detection**: Take a photo of a leaf. If it analyzes successfully, the **ML API** is working.
- [ ] **Crop Recommendations**: Submit the form. If it saves, the **Database** is working.

---

**🎉 Congratulations on your detailed verification & build!**
