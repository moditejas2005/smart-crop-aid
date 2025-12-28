

const http = require('http');
const crypto = require('crypto');

// 1. We need a way to insert. The Admin API requires a token.
// Ideally we should just use a direct SQL insert via the db pool if available, 
// but we only have HTTP access in this context unless we import db.js.
// Let's import the db module directly to seed data, it's easier.
const pool = require('./db');

async function runTest() {
  try {
    console.log('🌱 Seeding Market Price...');
    const id = crypto.randomUUID();
    const date = new Date().toISOString().split('T')[0];
    
    // Insert a valid price
    await pool.query(
      `INSERT INTO market_prices (id, crop_name, variety, price, unit, market_name, location, region, date, trend, change_percentage, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
      [id, 'Test Wheat', 'Golden', 2550.50, 'per quintal', 'Test Mandi', 'Test City', 'Test State', date, 'up', 5.2]
    );
    console.log('✅ Seeded Price: 2550.50');

    // 2. Fetch via API
    console.log('📡 Fetching from API...');
    
    // Use the native http module check
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/market-prices',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const item = json.prices.find(p => p.id === id);
          
          if (item) {
            console.log('🎯 Found Item:', JSON.stringify(item, null, 2));
            console.log(`💲 Modal Price Value: ${item.modalPrice}`);
            console.log(`📊 Type of Modal Price: ${typeof item.modalPrice}`);
            
            if (item.modalPrice === 2550.5) {
                console.log('✅ SUCCESS: Price is preserved correctly.');
            } else {
                console.log('❌ FAILURE: Price mismatch.');
            }
          } else {
              console.log('❌ Error: Seeded item not found in response.');
          }
           process.exit(0);
        } catch (e) {
          console.error(e);
          process.exit(1);
        }
      });
    });
    
    req.end();

  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  }
}

runTest();

