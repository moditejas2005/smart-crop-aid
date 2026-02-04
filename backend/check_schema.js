// Check table schema
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'tejas',
    database: process.env.DB_NAME || 'smart_crop_aid'
  });
  
  try {
    const [rows] = await c.execute('DESCRIBE users');
    const isBannedCol = rows.find(r => r.Field === 'is_banned');
    if (isBannedCol) {
      console.log('✅ is_banned column exists:', isBannedCol);
    } else {
      console.error('❌ is_banned column MISSING!');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await c.end();
  }
})();
