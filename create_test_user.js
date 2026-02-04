const pool = require('./backend/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function createTestUser() {
  try {
    console.log('👤 Creating test user...\n');
    
    // Check if user already exists
    const [existing] = await pool.execute('SELECT * FROM users WHERE email = ?', ['test@farmer.com']);
    if (existing.length > 0) {
      console.log('ℹ️  Test user already exists');
      console.log('Email: test@farmer.com');
      console.log('Password: test123');
      await pool.end();
      return;
    }
    
    // Create test farmer
    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash('test123', 10);
    
    await pool.execute(
      `INSERT INTO users (id, email, password_hash, name, role, location, farm_lat, farm_lng, created_at, updated_at, last_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [id, 'test@farmer.com', passwordHash, 'Test Farmer', 'farmer', 'Delhi', 28.6139, 77.2090]
    );
    
    console.log('✅ Test user created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('Email: test@farmer.com');
    console.log('Password: test123');
    console.log('\nYou can now login to the app with these credentials.');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    process.exit(1);
  }
}

createTestUser();
