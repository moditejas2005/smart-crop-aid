# 🚀 Smart Crop Aid - Deployment Instructions

This guide provides detailed, step-by-step instructions to deploy the entire Smart Crop Aid stack to **100% FREE** cloud hosting providers.

| Component | Hosting Provider | Cost | Limits |
|-----------|------------------|------|--------|
| **Database** | Neon (PostgreSQL) | Free | 0.5 GB Storage |
| **Backend API** | Render | Free | 750 hours/month |
| **ML/AI API** | Hugging Face Spaces | Free | 16GB RAM, 2 vCPU |
| **Mobile App** | Expo (EAS) | Free | 30 builds/month |

---

## Part 1: Database Deployment (Neon)

1.  **Create Account**:
    *   Go to [https://neon.tech](https://neon.tech) and sign up.
2.  **Create Project**:
    *   Name: `smart-crop-aid`
    *   Region: Select the one closest to you (e.g., `Singapore`).
    *   Version: PostgreSQL 15 or 16.
3.  **Get Connection String**:
    *   On the Dashboard, copy the **Connection String** (e.g., `postgres://user:pass@...`).
    psql 'postgresql://neondb_owner:npg_0jLnlQtJ2ceZ@ep-square-block-a108ejo6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    *   **Save this!** You will need it for the Backend deployment.
4.  **Import Schema**:
    *   In the Neon Dashboard, go to **SQL Editor**.
    *   Open `backend/schema_postgres.sql` from your local project.
    *   Copy the entire content and paste it into the Neon SQL Editor.
    *   Click **Run**.
    *   *Verify*: Check the "Tables" tab to ensure `users`, `crops`, `pest_reports`, etc., are created.

---

## Part 2: Backend API Deployment (Render)

1.  **Create Account**:
    *   Go to [https://render.com](https://render.com) and sign up/login.
2.  **New Web Service**:
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository.
3.  **Configuration**:
    *   **Name**: `smart-crop-aid-api`
    *   **Region**: Same as Database (e.g., Singapore).
    *   **Branch**: `main`
    *   **Root Directory**: `backend` (Important!)
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
    *   **Instance Type**: `Free`.
4.  **Environment Variables**:
    *   Scroll down to "Environment Variables" and add:
        *   `DATABASE_URL`: postgresql://neondb_owner:npg_0jLnlQtJ2ceZ@ep-square-block-a108ejo6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
        *   `JWT_SECRET`: a28981c7e0d2d74b8f32796089fe558c
        *   `NODE_ENV`: `production`
5.  **Deploy**:
    *   Click **Create Web Service**.
    *   Wait for deployment (3-5 mins).
    *   **Copy URL**: Once live, copy the URL (e.g., `https://smart-crop-aid-api.onrender.com`).

---

## Part 3: ML API Deployment (Hugging Face)

1.  **Create Space**:
    *   Go to [https://huggingface.co/spaces](https://huggingface.co/spaces). password:jghzdszdxffguc byhbuEgvhil@2005
    *   Click **Create new Space**.
    *   **Space Name**: `smart-crop-aid-ml`
    *   **License**: `Apache 2.0`
    *   **SDK**: `Docker` (Important!)
    *   **Hardware**: `Default` (Free - 2 vCPU, 16GB RAM).
2.  **Upload Code**:
    *   Option A (Git): Follow the instructions to clone the space and push your files.
    *   Option B (Web UI):
        *   Go to **Files** tab.
        *   Click **Add file** -> **Upload files**.
        *   **CRITICAL**: Open your local `Plant-Disease-Recognition-System-main` folder. Select **ALL files inside it** (Dockerfile, requirements.txt, api_server.py, etc.) and drag them.
        *   **Do NOT drag the folder itself.** The `Dockerfile` must be at the main root of your Space, not inside a subfolder.
3.  **Upload Model (Critical)**:
    *   The model file (`models/pest_detection_model_pwp.keras`) is large (~200MB).
    *   **Web Upload**: You might need to upload this file separately if it fails in bulk upload.
    *   Ensure it goes into a folder named `models` inside the space.
4.  **Important: Metadata File**:
    *   Ensure the `README.md` file in your upload contains the following metadata at the very top:
    ```yaml
    ---
    title: Smart Crop Aid Ml
    emoji: 🌿
    colorFrom: green
    colorTo: blue
    sdk: docker
    app_port: 7860
    ---
    ```
    *   If you see "Space is missing an app file", it's because this metadata (or the Dockerfile) is missing or not in the root.

5.  **Deploy**:
    *   Hugging Face automatically builds the Dockerfile.
    *   Watch the **Logs** tab. It will take 5-10 minutes to build TensorFlow.
    *   Once "Running", you will see your API URL at the top (click the three dots -> "Embed this space" to see the direct URL, typically `https://{username}-{spacename}.hf.space`).
    *   **Test**: Visit `https://tejasmodi05-smart-crop-aid-ml.hf.space/api/health` to confirm it returns `{"status": "healthy"}`.

---

## Part 4: Mobile App Deployment (Expo EAS)

1.  **Install EAS CLI**:
    ```bash
    npm install -g eas-cli
    eas login
    ```
2.  **Configure Environment**:
    *   EAS Build uses your local `.env` values or secrets configured in Expo Dashboard.
    *   **Recommended**: Create a **Secret** in Expo Dashboard or use `eas.json` env.
    *   For simplicity, ensure your local `.env` has the production URLs before building, OR set them in `eas.json`.
    
    *Update your root `.env` (or create one):*
    ```env
    EXPO_PUBLIC_API_URL=https://smart-crop-aid-api.onrender.com/api
    EXPO_PUBLIC_ML_API_URL=https://tejasmodi05-smart-crop-aid-ml.hf.space
    ```

3.  **Build Preview APK (Android)**:
    *   This builds an APK you can install on your phone to test.
    ```bash
    eas build --platform android --profile preview
    ```
    *   Wait for the build queue (Free tier takes ~15-45 mins).
    *   Download the `.apk` from the link provided.

4.  **Build Production Bundle (Google Play)**:
    *   This builds an `.aab` file for the Play Store.
    ```bash
    eas build --platform android --profile production
    ```

---

## 🚀 Final Verification

1.  Install the **Preview APK** on your Android device.
2.  **Sign Up**: Create a new account. (This tests the **Render** backend + **Neon** database).
3.  **Pest Detection**: Upload a leaf image. (This tests the **Hugging Face** ML API).
4.  **Market Prices**: Check the prices tab.
5.  **Profile**: Update your profile.

**Congratulations! Your Free Tier Production Architecture is Live!**
