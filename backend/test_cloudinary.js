const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testUpload() {
  console.log('🧪 Testing Cloudinary Integation...');
  console.log('   ENV File Path:', path.join(__dirname, '.env'));
  console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || 'UNDEFINED');
  console.log('   API Key:', process.env.CLOUDINARY_API_KEY ? 'DEFINED' : 'UNDEFINED');

  // Create a dummy file to upload
  const dummyPath = path.join(__dirname, 'test_image.txt');
  fs.writeFileSync(dummyPath, 'This is a test file for Smart Crop Aid');

  try {
    const result = await cloudinary.uploader.upload(dummyPath, {
      folder: 'smart-crop-aid-test',
      resource_type: 'raw' // Since it's a txt file
    });

    console.log('✅ Upload Successful!');
    console.log('   URL:', result.secure_url);
    
    // Cleanup
    fs.unlinkSync(dummyPath);
    console.log('🧹 Cleanup done.');

  } catch (error) {
    console.error('❌ Upload Failed:', error.message);
  }
}

testUpload();
