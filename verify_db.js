const pool = require('./backend/db');

async function verifyDatabase() {
  console.log('🔍 Verifying database setup...\n');
  
  const queries = [
    { name: 'Tables', query: 'SHOW TABLES' },
    { name: 'User count', query: 'SELECT COUNT(*) as count FROM users' },
    { name: 'Crops count', query: 'SELECT COUNT(*) as count FROM crops' },
    { name: 'Pest Reports count', query: 'SELECT COUNT(*) as count FROM pest_reports' },
    { name: 'Chat Messages count', query: 'SELECT COUNT(*) as count FROM chat_messages' }
  ];
  
  for (const { name, query } of queries) {
    try {
      const [rows] = await pool.execute(query);
      console.log(`✅ ${name}:`, rows);
    } catch (error) {
      console.error(`❌ ${name} query failed:`, error.message);
    }
  }
  
  await pool.end();
  console.log('\n✅ Verification complete');
}

verifyDatabase();
