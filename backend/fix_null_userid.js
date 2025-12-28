// Fix: Allow NULL user_id in crop_recommendations table
const pool = require('./db');

async function fix() {
  console.log('Fixing crop_recommendations table to allow NULL user_id...');
  
  try {
    // First drop the foreign key constraint
    await pool.execute('ALTER TABLE crop_recommendations DROP FOREIGN KEY crop_recommendations_ibfk_1');
    console.log('✓ Dropped foreign key constraint');
  } catch (e) {
    console.log('Foreign key may not exist, continuing...');
  }

  try {
    // Modify user_id to allow NULL
    await pool.execute('ALTER TABLE crop_recommendations MODIFY COLUMN user_id CHAR(36) NULL');
    console.log('✓ Modified user_id to allow NULL');
    
    // Re-add foreign key with ON DELETE SET NULL
    await pool.execute(`
      ALTER TABLE crop_recommendations 
      ADD CONSTRAINT crop_recommendations_user_fk 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    `);
    console.log('✓ Added foreign key constraint with ON DELETE SET NULL');
    
    console.log('\\n✅ Fix completed successfully!');
  } catch (error) {
    console.error('Fix failed:', error.message);
  }
  
  process.exit(0);
}

fix();
