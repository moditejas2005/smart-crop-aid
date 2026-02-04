const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool
// Uses DATABASE_URL environment variable if available (Render/Neon standard)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Needed for some cloud providers like Neon/Render
  } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL Database');
    
    // Check schema version or existence of tables
    // In PostgreSQL we use a different way to check tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users';
    `);

    if (res.rowCount === 0) {
      console.log('⚠️ Users table not found. Please run the schema migration.');
    } else {
      console.log('✅ Verified schema exists');
    }

    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();

module.exports = pool;
