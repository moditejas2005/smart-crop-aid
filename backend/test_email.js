const { sendWelcomeEmail } = require('./utils/emailService');

/**
 * Test script to verify SMTP email configuration
 * Run: node test_email.js
 */

const testEmail = async () => {
  console.log('🧪 Testing SMTP Email Configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log('SMTP_EMAIL:', process.env.SMTP_EMAIL ? '✅ Set' : '❌ Missing');
  console.log('SMTP_APP_PASSWORD:', process.env.SMTP_APP_PASSWORD ? '✅ Set' : '❌ Missing');
  console.log('');
  
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_APP_PASSWORD) {
    console.error('❌ SMTP credentials not configured in .env file');
    process.exit(1);
  }
  
  // Test sending email
  console.log('📧 Attempting to send test email...');
  const testRecipient = process.env.SMTP_EMAIL; // Send to self for testing
  
  try {
    const result = await sendWelcomeEmail(testRecipient, 'Test User');
    
    if (result) {
      console.log('\n✅ SUCCESS! Email sent successfully.');
      console.log('Check your inbox at:', testRecipient);
    } else {
      console.log('\n⚠️ Email service returned false (check logs above)');
    }
  } catch (error) {
    console.error('\n❌ FAILED! Error:', error.message);
    process.exit(1);
  }
};

// Load environment variables
require('dotenv').config();

// Run test
testEmail();
