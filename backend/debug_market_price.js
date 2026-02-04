
const http = require('http');
const crypto = require('crypto');
const pool = require('./db');

async function runTest() {
  try {
    const id = crypto.randomUUID();
    const date = new Date().toISOString().split('T')[0];
    
    // Seed
    await pool.query(
      `INSERT INTO market_prices (id, crop_name, variety, price, unit, date, created_at, updated_at)
       VALUES ($1, 'Debug Crop', 'Debug Var', 1234.56, 'kg', $2, NOW(), NOW())`,
      [id, date]
    );

    // Fetch
    const req = http.get('http://localhost:3000/api/market-prices', (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const json = JSON.parse(data);
        const item = json.prices.find(p => p.id === id);
        
        if (item) {
             console.log(`[DEBUG] ID: ${item.id}`);
             console.log(`[DEBUG] PRE-INSERT: 1234.56`);
             console.log(`[DEBUG] POST-FETCH: ${item.modalPrice}`);
             console.log(`[DEBUG] TYPE: ${typeof item.modalPrice}`);
        } else {
             console.log('[DEBUG] Item not found');
        }
        process.exit(0);
      });
    });
  } catch (e) {
    console.error(e);
  }
}

runTest();
