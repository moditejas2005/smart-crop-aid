// Force reset admin password
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const ADMIN_EMAIL = 'admin@smartcrop.com';
const ADMIN_PASSWORD = 'admin123';

(async () => {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'tejas',
    database: process.env.DB_NAME || 'smart_crop_aid'
  });
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(ADMIN_PASSWORD, salt);
    
    await c.execute(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [hash, ADMIN_EMAIL]
    );
    
    console.log(`✅ Password reset for ${ADMIN_EMAIL} to: ${ADMIN_PASSWORD}`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await c.end();
  }
})();
