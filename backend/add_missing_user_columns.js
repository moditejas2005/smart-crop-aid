
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to DB');

    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS soil_type VARCHAR(100),
      ADD COLUMN IF NOT EXISTS crop_history TEXT;
    `);

    console.log('✅ Successfully added missing columns (soil_type, crop_history)');
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
