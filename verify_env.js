// Environment Variables Verification Script
console.log('🔍 Checking Environment Variables...\n');

const requiredVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_BYTEZ_API_KEY',
  'EXPO_PUBLIC_VISION_API_KEY',
  'EXPO_PUBLIC_TREFLE_API_TOKEN'
];

let allPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allPresent = false;
  }
});

console.log('\n📋 Summary:');
if (allPresent) {
  console.log('🎉 All required environment variables are set!');
} else {
  console.log('⚠️  Some environment variables are missing.');
  console.log('💡 Make sure your .env file exists and restart the Expo server.');
}

console.log('\n🔧 Troubleshooting:');
console.log('1. Check if .env file exists in the root directory');
console.log('2. Restart Expo server: npx expo start --clear');
console.log('3. Make sure variable names start with EXPO_PUBLIC_');