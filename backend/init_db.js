const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDb() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: 'root',
      password: 'tejas',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL Server');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('⏳ Running schema...');
    await connection.query(schema);

    console.log('✅ Database initialized successfully');
    await connection.end();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDb();
