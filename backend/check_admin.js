// Quick check script
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'tejas',
    database: process.env.DB_NAME || 'smart_crop_aid'
  });
  
  const [rows] = await c.execute("SELECT email, role FROM users WHERE role = 'admin'");
  console.log('Admin users:', rows);
  
  if (rows.length === 0) {
    console.log('No admin found! Creating one...');
    const bcrypt = require('bcrypt');
    const crypto = require('crypto');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    const id = crypto.randomUUID();
    await c.execute(
      "INSERT INTO users (id, email, password_hash, name, role, is_banned, created_at, updated_at, last_active) VALUES (?, 'admin@smartcrop.com', ?, 'Admin', 'admin', FALSE, NOW(), NOW(), NOW())",
      [id, hash]
    );
    console.log('Admin created: admin@smartcrop.com / admin123');
  }
  
  await c.end();
})();
