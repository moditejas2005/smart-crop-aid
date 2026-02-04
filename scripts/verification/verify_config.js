// verify_config.js
// This script checks your environment and tells you if the app is in "Real AI" or "Random Demo" mode.

require('dotenv').config(); // Load .env if available

function checkStatus() {
  console.log('--- SMART CROP AID DIAGNOSTIC ---\n');

  // 1. Check Vision AI (Pest Detection)
  const visionKey = process.env.EXPO_PUBLIC_VISION_API_KEY;
  console.log('1. PEST DETECTION MODE:');
  if (visionKey && visionKey.startsWith('sk-')) {
    console.log('   ✅ Real AI Mode (ACTIVE)');
    console.log('   Using API Key: ' + visionKey.substring(0, 8) + '...');
  } else {
    console.log('   ⚠️  Random Simulation Mode (ACTIVE)');
    console.log('   Reason: EXPO_PUBLIC_VISION_API_KEY is missing or invalid.');
    console.log('   (The app will generate fake pest results)');
  }

  console.log('\n---------------------------------\n');

  // 2. Check Weather API
  const weatherKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
  console.log('2. WEATHER MODE:');
  if (weatherKey && weatherKey.length > 20) {
     console.log('   ✅ Real Live Weather (ACTIVE)');
  } else {
     console.log('   ⚠️  Demo Weather Mode (ACTIVE)');
     console.log('   Reason: EXPO_PUBLIC_WEATHER_API_KEY is missing.');
     console.log('   (The app will show [DEMO] locations)');
  }
}

checkStatus();
