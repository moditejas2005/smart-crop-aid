# Smart Crop Aid - Technical Project Summary

## 🛠️ Key Libraries & Technologies

### 1. Frontend (Mobile App)
**Framework**: React Native (via Expo SDK 54)

| Feature | Library | Purpose |
|---------|---------|---------|
| **Camera & Images** | `expo-image-picker` | Allows users to capture photos (Camera) or select from Gallery for pest detection. |
| **Location** | `expo-location` | Fetches the user's GPS coordinates (Latitude/Longitude) to provide local weather data and crop recommendations. |
| **Maps & Geocoding** | `expo-location` | Converts GPS coordinates into readable city names (Reverse Geocoding). |
| **Navigation** | `expo-router` | Handles navigation between screens using file-based routing. |
| **Storage** | `@react-native-async-storage/async-storage` | Saves user session tokens locally on the phone so they stay logged in. |
| **Icons** | `lucide-react-native` | Provides modern, vector icons used throughout the UI. |
| **HTTP Requests** | `fetch` (Native) | Used to communicate with the Backend API and ML API. |

### 2. Backend (API Server)
**Runtime**: Node.js + Express
**Hosting**: Vercel (Serverless)

| Feature | Library | Purpose |
|---------|---------|---------|
| **Database Driver** | `pg` | Connects the Node.js server to the Neon PostgreSQL database. |
| **Password Hashing** | `bcrypt` | Securely hashes passwords before saving them to the database. |
| **Authentication** | `jsonwebtoken` | Generates secure JWT tokens for user login sessions. |
| **Image Uploads** | `multer` + `multer-storage-cloudinary` | Handles file uploads from the app and sends them to Cloudinary storage. |
| **CORS** | `cors` | Allows the mobile app to communicate with the backend server. |

### 3. Machine Learning (AI)
**Framework**: TensorFlow / Keras
**Hosting**: Hugging Face Spaces (Docker)

| Feature | Library | Purpose |
|---------|---------|---------|
| **Web Server** | `Flask` | Lightweight Python web server to expose the model as an API. |
| **Image Processing** | `Pillow (PIL)` | Resizes and processes images to 160x160 pixels before analysis. |
| **Model Loader** | `tensorflow` | Loads the pre-trained `.keras` model (`pest_detection_model_pwp.keras`) for inference. |

---

## 🔐 Security Mechanisms

### 1. How Passwords are Hidden (Frontend)
When a user types their password in the app, it is hidden using the `secureTextEntry` prop in React Native's `<TextInput>` component.

**Code Example (`app/index.tsx`):**
```javascript
<TextInput
  value={password}
  // This prop hides the text with dots (••••••)
  secureTextEntry={!showPassword} 
/>
```
*   The `!showPassword` state acts as a toggle. By default, it is hidden.
*   Clicking the "Eye" icon toggles this boolean, temporarily revealing the password.

### 2. How Passwords are Saved (Backend)
**CRITICAL**: Passwords are **NEVER** saved in plain text. We use **Hashing**.

**The Process:**
1.  **Salt Generation**: The server generates a random string called a "salt".
2.  **Hashing**: The library `bcrypt` combines the password + salt and mathematically scrambles them into a unique string (hash). This process is irreversible.
3.  **Storage**: Only the **Hash** is saved in the database.

**Code Example (`backend/routes/auth.js`):**
```javascript
const bcrypt = require('bcrypt');

// 1. Generate Salt (Random data)
const salt = await bcrypt.genSalt(10);

// 2. Hash the password
const passwordHash = await bcrypt.hash(password, salt);

// 3. Save to Database
await pool.query(
  'INSERT INTO users (password_hash, ...) VALUES ($1, ...)', 
  [passwordHash, ...]
);
```

**Verification (Login):**
When a user logs in, `bcrypt` takes the input password, applies the *same* operation, and compares the result with the stored hash.

### 3. Environment Variables (`.env`)
Sensitive keys are kept out of the code using `.env` files.
*   **Database URL**: `DATABASE_URL=postgres://...`
*   **JWT Secret**: `JWT_SECRET=...`
*   **Cloudinary Keys**: `CLOUDINARY_API_SECRET=...`

These are loaded using the `dotenv` library on the backend. This ensures that even if the code is shared, the secrets remain private.
