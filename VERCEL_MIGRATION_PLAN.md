# ☁️ Vercel + Cloudinary Migration Plan

This guide outlines the steps to upgrade your backend from a basic file server (which only works on Render) to a **Serverless Architecture** (compatible with Vercel) using **Cloudinary** for image storage.

---

## 📋 Prerequisites
Before we code, you need to get your free Cloudinary credentials.

1.  **Sign Up**: Go to [Cloudinary.com](https://cloudinary.com/users/register/free) and sign up for a free account.
2.  **Get Credentials**: On your Dashboard, find:
    *   **Cloud Name**
    *   **API Key**
    *   **API Secret**

---

## 📝 Step-by-Step Implementation

### Step 1: Install Dependencies
We need new libraries to talk to Cloudinary.
*   `cloudinary`: The official SDK.
*   `multer-storage-cloudinary`: A bridge to make file uploads go directly to Cloudinary.

### Step 2: Configure Environment Variables
We will add your Cloudinary keys to `.env`.
```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Step 3: Refactor Upload Logic (`routes/upload.js`)
*   **Current**: Saves file to `uploads/` folder on disk.
*   **New**: Streams file directly to Cloudinary and returns the secure URL (`https://res.cloudinary.com/...`).

### Step 4: Create Vercel Configuration (`vercel.json`)
Vercel needs to know how to handle requests since it's serverless.
*   We will tell Vercel to route all `/api/*` requests to `server.js`.

### Step 5: Verify & Deploy
1.  **Test Locally**: Ensure uploads still work (they should now appear in your Cloudinary media library).
2.  **Push to GitHub**: This triggers nothing yet (since we aren't on Vercel).
3.  **Import to Vercel**: Connect your GitHub repo to Vercel.

---

## 🛠️ Execution Plan

- [ ] **Install Packages**: `npm install cloudinary multer-storage-cloudinary`
- [ ] **Update Code**: Rewrite `backend/routes/upload.js`
- [ ] **Add Config**: Create `vercel.json`
- [ ] **Deploy**: Push to GitHub and Setup Vercel Project

**Ready to start? Need those Cloudinary Keys first!**
