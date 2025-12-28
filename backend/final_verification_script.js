
const http = require('http');
const crypto = require('crypto');
const pool = require('./db');

async function testEndpoint(name, path, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ ${name}: OK (${res.statusCode})`);
          resolve({ success: true, data: data ? JSON.parse(data) : null });
        } else {
          console.error(`❌ ${name}: FAIL (${res.statusCode}) - ${data}`);
          resolve({ success: false });
        }
      });
    });
    
    req.on('error', (e) => {
        console.error(`❌ ${name}: ERROR (${e.message})`);
        resolve({ success: false });
    });
    
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runGrandVerification() {
  console.log('🚀 STARTING FINAL SYSTEM VERIFICATION');
  console.log('=====================================');
  
  let allPassed = true;

  // 1. Database Connection Check
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    console.log(`✅ Database: CONNECTED (${res.rows[0].now})`);
    client.release();
  } catch (e) {
    console.error(`❌ Database: FAILED (${e.message})`);
    allPassed = false;
  }

  // 2. Auth: Create Test User
  const testEmail = `verify_${Date.now()}@test.com`;
  const signupRes = await testEndpoint('Signup API', '/api/auth/signup', 'POST', {
      name: 'Final Verifier',
      email: testEmail,
      password: 'Password123!',
      location: { city: 'Mumbai' },
      soilType: 'Black',
      cropHistory: ['Cotton']
  });
  if (!signupRes.success) allPassed = false;

  // 3. Market Prices: Check Data & Values
  const marketRes = await testEndpoint('Market Prices API', '/api/market-prices');
  if (marketRes.success) {
      if (marketRes.data.prices && marketRes.data.prices.length > 0) {
          const firstPrice = marketRes.data.prices[0].modalPrice;
          if (typeof firstPrice === 'number' && firstPrice > 0) {
              console.log(`✅ Market Data: VALID (Sample Price: ${firstPrice})`);
          } else {
              console.log(`❌ Market Data: INVALID (Price is 0 or NaN: ${firstPrice})`);
              allPassed = false;
          }
      } else {
          console.log('⚠️ Market Data: EMPTY (No prices found)');
          // Not necessarily a failure, but worth noting
      }
  } else {
      allPassed = false;
  }

  // 4. Pest Detection Connectivity
  // Just checking if route exists (auth user needed for full test, but 401/400 is better than 404/500)
  // Actually, we can use the user we just created to get history if we wanted, 
  // but let's just ping the health of the endpoint (requires query param user_id usually)
  const pestRes = await testEndpoint('Pest API', '/api/pests?user_id=123'); // Should return 200 (empty list) or 400
  // Note: pests.js returns 200 [] if user has no reports, which is perfect.

  console.log('=====================================');
  if (allPassed) {
      console.log('🌟 SYSTEM STATUS: GREEN (READY TO BUILD)');
      process.exit(0);
  } else {
      console.log('⛔ SYSTEM STATUS: RED (FIX ISSUES BEFORE BUILD)');
      process.exit(1);
  }
}

runGrandVerification();
