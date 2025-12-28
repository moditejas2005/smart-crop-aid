# MySQL Access Denied Fix

## Problem
Getting error: `Access denied for user 'johndoe'@'localhost' (using password: YES)`

## Root Cause
Prisma is trying to connect with the wrong credentials because the `DATABASE_URL` environment variable is not set.

## Solution

### Step 1: Update your .env file
Add or update the following line in `backend/.env`:

```env
DATABASE_URL="mysql://root:tejas@localhost:3306/smart_crop_aid"
```

### Step 2: Verify MySQL User Permissions
Make sure the MySQL user has proper permissions. Run these commands in MySQL:

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Grant all privileges (if needed)
GRANT ALL PRIVILEGES ON smart_crop_aid.* TO 'root'@'localhost';
FLUSH PRIVILEGES;

-- Verify the database exists
SHOW DATABASES;

-- Use the database
USE smart_crop_aid;

-- Show tables
SHOW TABLES;
```

### Step 3: Regenerate Prisma Client
After updating the environment variable, regenerate the Prisma client:

```bash
cd backend
npx prisma generate
```

### Step 4: Test the Connection
Restart your backend server:

```bash
npm start
```

## Alternative: Create 'johndoe' User (Not Recommended)
If you want to keep the old configuration, you can create the missing user:

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create the johndoe user
CREATE USER 'johndoe'@'localhost' IDENTIFIED BY 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON smart_crop_aid.* TO 'johndoe'@'localhost';
FLUSH PRIVILEGES;
```

## Verification
After fixing, test the connection:

```bash
# Test backend connection
cd backend
node -e "require('./db').testConnection()"
```

You should see: ✅ Connected to MySQL Database
