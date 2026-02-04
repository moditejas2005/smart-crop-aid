/**
 * Create/Promote Admin User Script
 * Run: node scripts/create_admin.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();

const ADMIN_EMAIL = 'admin@smartcrop.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Admin User';

async function createAdmin() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'tejas',
      database: process.env.DB_NAME || 'smart_crop_aid',
    });

    console.log('✅ Connected to database');

    // First, add is_banned column if it doesn't exist
    try {
      await connection.execute(`
        ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE AFTER role
      `);
      console.log('✅ Added is_banned column');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  is_banned column already exists');
      } else {
        throw err;
      }
    }

    // Check if admin exists
    const [existingUsers] = await connection.execute(
      'SELECT id, role FROM users WHERE email = ?',
      [ADMIN_EMAIL]
    );

    if (existingUsers.length > 0) {
      // Update existing user to admin
      await connection.execute(
        'UPDATE users SET role = ? WHERE email = ?',
        ['admin', ADMIN_EMAIL]
      );
      console.log(`✅ Updated ${ADMIN_EMAIL} to admin role`);
    } else {
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);
      const id = crypto.randomUUID();

      await connection.execute(
        `INSERT INTO users (id, email, password_hash, name, role, is_banned, created_at, updated_at, last_active) 
         VALUES (?, ?, ?, ?, 'admin', FALSE, NOW(), NOW(), NOW())`,
        [id, ADMIN_EMAIL, passwordHash, ADMIN_NAME]
      );
      console.log(`✅ Created new admin user: ${ADMIN_EMAIL}`);
    }

    console.log('\n========================================');
    console.log('🔑 ADMIN CREDENTIALS:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('========================================\n');
    console.log('You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdmin();
