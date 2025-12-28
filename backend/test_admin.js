// Quick test script for admin endpoints
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const BASE_URL = 'http://localhost:3000/api';

async function testAdminEndpoints() {
  console.log('🧪 Testing Admin Endpoints...\n');
  
  try {
    // Get an admin user from the database
    const [admins] = await pool.execute("SELECT id, email FROM users WHERE role = 'admin' LIMIT 1");
    
    if (admins.length === 0) {
      console.log('❌ No admin user found. Please create one first.');
      process.exit(1);
    }
    
    const admin = admins[0];
    console.log(`✅ Found admin: ${admin.email}`);
    
    // Generate a valid JWT token
    const token = jwt.sign({ id: admin.id, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    console.log('✅ Generated JWT token\n');
    
    // Test /admin/stats endpoint
    console.log('📊 Testing /admin/stats...');
    const statsResponse = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsData = await statsResponse.json();
    
    if (statsResponse.ok) {
      console.log('✅ Stats endpoint working!');
      console.log('   Total Users:', statsData.stats.totalUsers);
      console.log('   Active Users:', statsData.stats.activeUsers);
      console.log('   Pest Detections:', statsData.stats.pestDetections);
      console.log('   Crop Recommendations:', statsData.stats.cropRecommendations);
      console.log('   Chat Interactions:', statsData.stats.chatInteractions);
    } else {
      console.log('❌ Stats endpoint failed:', statsData.error);
    }
    
    // Test /admin/users endpoint
    console.log('\n👥 Testing /admin/users...');
    const usersResponse = await fetch(`${BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const usersData = await usersResponse.json();
    
    if (usersResponse.ok) {
      console.log('✅ Users endpoint working!');
      console.log(`   Found ${usersData.users.length} users`);
      if (usersData.users.length > 0) {
        const sampleUser = usersData.users[0];
        console.log(`   Sample user: ${sampleUser.name} (is_banned: ${sampleUser.is_banned}, type: ${typeof sampleUser.is_banned})`);
      }
    } else {
      console.log('❌ Users endpoint failed:', usersData.error);
    }
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await pool.end();
  }
}

testAdminEndpoints();
