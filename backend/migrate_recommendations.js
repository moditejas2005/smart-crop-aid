// Migration script to add crop_recommendations table and drop chat_messages
const pool = require('./db');

async function migrate() {
  console.log('Starting database migration...');
  
  try {
    // Create crop_recommendations table
    console.log('Creating crop_recommendations table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS crop_recommendations (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id CHAR(36),
        soil_type VARCHAR(50) NOT NULL,
        water_level VARCHAR(20) NOT NULL,
        season VARCHAR(20) NOT NULL,
        recommendations_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✓ crop_recommendations table created');

    // Drop chat_messages table
    console.log('Dropping chat_messages table...');
    await pool.execute('DROP TABLE IF EXISTS chat_messages');
    console.log('✓ chat_messages table dropped');

    console.log('\\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
