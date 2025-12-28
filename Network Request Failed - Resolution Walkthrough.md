# Network Configuration Guide

## Problem Summary
The React Native app was experiencing a "Network request failed" error during login attempts. The error occurred in the authentication context when trying to connect to the backend API.

## Root Cause
The backend Node.js server was not running. While the Expo development server and Prisma Studio were active, the main API server on port 3000 was not started.

---

## Resolution Steps

### 1. Started the Backend Server
Started the Node.js backend server which listens on port 3000:

```bash
cd e:\Tejas\smart-crop-aid\backend
node server.js
```

**Server Output:**
```
🚀 Server running on http://localhost:3000
📱 Accessible on network at http://<your-ip>:3000
✅ Connected to MySQL Database
```

### 2. Identified Network Configuration Issue
Discovered that the API client was configured with an outdated IP address (`192.168.137.222`) that didn't match the current network configuration.

**Current Network IPs:**
- Wi-Fi: `10.81.211.94`
- Ethernet 3: `192.168.73.1`

### 3. Updated API Configuration
Updated [utils/api.ts](file:///e:/Tejas/smart-crop-aid/utils/api.ts#L9-L13) to use the correct Wi-Fi IP address:

```diff
 const DEV_API_URL = Platform.select({
-  android: 'http://192.168.137.222:3000/api',
-  ios: 'http://192.168.137.222:3000/api',
+  android: 'http://10.81.211.94:3000/api',
+  ios: 'http://10.81.211.94:3000/api',
   default: 'http://localhost:3000/api', // Web
 });
```

### 4. Verified Connectivity
Tested the API endpoints to confirm the server is accessible:

**Root Endpoint Test:**
```bash
curl http://10.81.211.94:3000
```
✅ Response: `{"message": "Smart Crop Aid Backend is running"}`

**Login Endpoint Test:**
```bash
curl http://10.81.211.94:3000/api/auth/login -Method POST
```
✅ Server responds (returns validation error as expected without credentials)

---

## Testing the Login Flow

1. **Restart the Expo app** to pick up the new API configuration
2. **Try logging in** with valid credentials
3. The app should now successfully connect to the backend

---

## Important Notes

> [!IMPORTANT]
> The backend server must remain running for the app to function. Keep the terminal window with `node server.js` open.

> [!WARNING]
> If your computer's IP address changes (e.g., connecting to a different Wi-Fi network), you'll need to update the IP in [utils/api.ts](file:///e:/Tejas/smart-crop-aid/utils/api.ts) again.

---

## Alternative: Use Environment Variable

To avoid hardcoding the IP address, you can set it in your `.env` file:

```env
EXPO_PUBLIC_API_URL=http://10.81.211.94:3000/api
```

The API client already checks for this environment variable first:
```typescript
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEV_API_URL;
```

---

## How to Find Your IP Address

### Windows
```bash
ipconfig
```
Look for:
- **Wi-Fi**: `Wireless LAN adapter Wi-Fi` → `IPv4 Address`
- **Ethernet**: `Ethernet adapter` → `IPv4 Address`

### macOS/Linux
```bash
ifconfig
```
or
```bash
ip addr show
```

---

## Troubleshooting Network Issues

### Issue: "Network request failed"

**Possible Causes:**
1. Backend server is not running
2. IP address in `utils/api.ts` is incorrect
3. Firewall blocking connections
4. Phone/emulator not on the same network

**Solutions:**

#### 1. Check if Backend Server is Running
```bash
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000
```

If nothing is returned, start the server:
```bash
cd backend
node server.js
```

#### 2. Verify IP Address
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

Update [utils/api.ts](file:///e:/Tejas/smart-crop-aid/utils/api.ts) with the correct IP.

#### 3. Test API Connectivity
```bash
# Test from your computer
curl http://YOUR_IP:3000

# Should return: {"message": "Smart Crop Aid Backend is running"}
```

#### 4. Check Firewall Settings
- **Windows**: Allow Node.js through Windows Defender Firewall
- **macOS**: System Preferences → Security & Privacy → Firewall → Firewall Options
- Allow incoming connections on port 3000

#### 5. Ensure Same Network
- Physical device must be on the same Wi-Fi network as your computer
- Android emulator: Use `10.0.2.2` instead of your IP
- iOS simulator: Can use `localhost`

---

## Platform-Specific Configuration

### Android Emulator
```typescript
android: 'http://10.0.2.2:3000/api',  // Special IP for emulator
```

### iOS Simulator
```typescript
ios: 'http://localhost:3000/api',  // Localhost works on iOS simulator
```

### Physical Device
```typescript
android: 'http://YOUR_COMPUTER_IP:3000/api',
ios: 'http://YOUR_COMPUTER_IP:3000/api',
```

---

## Files Modified
- [utils/api.ts](file:///e:/Tejas/smart-crop-aid/utils/api.ts) - Updated API base URL with correct IP address

---

## Required Running Services

After this fix, you should have **three services** running:

| Service | Command | Port | Status |
|---------|---------|------|--------|
| Backend Server | `node server.js` | 3000 | ✅ Required |
| Expo Dev Server | `npx expo start` | 8081 | ✅ Required |
| Prisma Studio | `npx prisma studio` | 5555 | ⚠️ Optional |

### Starting All Services

**Terminal 1 - Backend Server:**
```bash
cd e:\Tejas\smart-crop-aid\backend
node server.js
```

**Terminal 2 - Expo Dev Server:**
```bash
cd e:\Tejas\smart-crop-aid
npx expo start
```

**Terminal 3 - Prisma Studio (Optional):**
```bash
cd e:\Tejas\smart-crop-aid\backend
npx prisma studio
```

---

## Quick Reference

### Current Configuration
- **Backend URL**: `http://10.81.211.94:3000/api`
- **Wi-Fi IP**: `10.81.211.94`
- **Backend Port**: `3000`
- **Database**: MySQL on `localhost:3306`

### API Endpoints
- `GET /` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/profile` - Get user profile
- `GET /api/crops` - Get crops
- `POST /api/pests` - Report pest
- `POST /api/chat` - Chat with AI
- `POST /api/upload` - Upload files

### Testing Endpoints
```bash
# Health check
curl http://10.81.211.94:3000

# Login (will fail without valid credentials)
curl -X POST http://10.81.211.94:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```
