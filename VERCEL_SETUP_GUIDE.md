# 🚀 Vercel Deployment Guide

Your code is now **Serverless-Ready**! It uses Cloudinary for images, so you can host it primarily on Vercel for free.

---

## Step 1: Push Code to GitHub
You must update your GitHub repository with the changes we just made (Cloudinary integration).
Run this command in your terminal:
```powershell
.\deploy_git.bat
```

---

## Step 2: Create Vercel Account
1.  Go to [https://vercel.com/signup](https://vercel.com/signup).
2.  **Continue with GitHub**.
3.  Authorize Vercel to access your GitHub account.

---

## Step 3: Import Project
1.  On your Vercel Dashboard, click **"Add New..."** -> **"Project"**.
2.  You should see your `smart-crop-aid` repository. Click **Import**.

---

## Step 4: Configure Project (Crucial!)
In the "Configure Project" screen:
1.  **Framework Preset**: Select `Other` (or leave default).
2.  **Root Directory**: Click "Edit" and select `backend` (since that's where the server code is).
3.  **Environment Variables**:
    *   Expand the "Environment Variables" section.
    *   Copy-paste these values (from your `.env` file):
        *   `DATABASE_URL` = postgresql://neondb_owner:npg_0jLnlQtJ2ceZ@ep-square-block-a108ejo6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
        *   `JWT_SECRET` = a28981c7e0d2d74b8f32796089fe558c
        *   `NODE_ENV` = `production`
        *   `CLOUDINARY_CLOUD_NAME` = `ddcd5mpvl`
        *   `CLOUDINARY_API_KEY` = `162527578895858`
        *   `CLOUDINARY_API_SECRET` = `rvZgnSmyxi_5dMOWjK5eSK_vXnw`

---

## Step 5: Deploy
1.  Click **Deploy**.
2.  Wait ~1 minute.
3.  **Success!** You will get a URL like `https://smart-crop-aid-api.vercel.app`.

---

## Step 6: Update Mobile App
Once you have the new Vercel URL:
1.  Open your project's `.env` file.
2.  Change `EXPO_PUBLIC_API_URL` to your new Vercel URL.
3.  Run `eas build` again to update your app.
