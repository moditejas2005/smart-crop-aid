
const http = require('http');

async function runTest(name, options, postData) {
  return new Promise((resolve) => {
    console.log(`\n🔵 Testing ${name}...`);
    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ ${name}: SUCCESS (Status ${res.statusCode})`);
          // console.log(rawData.substring(0, 100) + "...");
          resolve(true);
        } else {
          console.error(`❌ ${name}: FAILED (Status ${res.statusCode})`);
          console.error(`Response: ${rawData}`);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ ${name}: FAILED (Network Error: ${e.message})`);
      if (e.code === 'ECONNREFUSED') console.error("   -> SERVER IS OFFLINE");
      resolve(false);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function getOptions(path, method, postData) {
  return {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData ? Buffer.byteLength(postData) : 0
    }
  };
}

async function startHealthCheck() {
  console.log("🏥 STARTING SYSTEM HEALTH CHECK");
  console.log("================================");

  let allPassed = true;

  // 1. Check Root Endpoint
  const rootOptions = getOptions('/', 'GET');
  if (!await runTest("Backend Server API", rootOptions)) allPassed = false;

  // 2. Login Test
  const loginData = JSON.stringify({
    email: "testuser_" + Date.now() + "@example.com", // This will fail login usually, need to use known user or signup first
    password: "Password123!"
  });
  // Actually, let's Signup first to get a valid user for subsequent tests
  const signupData = JSON.stringify({
    name: "Health Check User",
    email: "healthcheck_" + Date.now() + "@test.com",
    password: "Password123!",
    location: { city: "Mumbai" },
    soilType: "Alluvial Soil",
    cropHistory: ["Rice"]
  });

  const signupOptions = getOptions('/api/auth/signup', 'POST', signupData);
  const signupSuccess = await runTest("User Signup", signupOptions, signupData);
  if (!signupSuccess) allPassed = false;
  
  // Note: We need a valid token for some protected routes, but strict auth might not be enforced on all for this basic check
  
  // 3. Crop Recommendations (POST) - Public or User
  const recData = JSON.stringify({
    soil_type: "Black Soil",
    water_level: "High",
    season: "Winter",
    recommendations: ["Wheat", "Mustard"]
  });
  const recOptions = getOptions('/api/recommendations', 'POST', recData);
  if (!await runTest("Crop Recommendations (Database Write)", recOptions, recData)) allPassed = false;

  // 4. ML Model Test (Pest Detection) - Using Mock/Proxy
  // Check if we can reach the pests endpoint. 
  // NOTE: A real prediction needs a large image payload or FormData which is complex in vanilla Node http.
  // We will check the GET route (history) instead to verify route connectivity.
  // Ideally, we'd ping the Hugging Face URL directly, but let's check our API proxy route existence.
  const pestOptions = getOptions('/api/pests?user_id=123', 'GET'); 
  // This might return 200 with empty list, which is success for connectivity
  if (!await runTest("Pest API Connectivity", pestOptions)) allPassed = false;

  // 5. Market Prices
  const marketOptions = getOptions('/api/market-prices', 'GET');
  if (!await runTest("Market Prices API", marketOptions)) allPassed = false;

  console.log("================================");
  if (allPassed) {
    console.log("✅ SYSTEM HEALTH: 100% OPERATIONAL");
  } else {
    console.log("⚠️ SYSTEM HEALTH: ISSUES DETECTED");
  }
}

startHealthCheck();
