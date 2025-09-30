#!/usr/bin/env node

// Test that configuration loads properly
console.log('Testing configuration loading...');

try {
  // Test loading the config
  const { config } = require('./dist/config/index.js');

  console.log('✅ Configuration loaded successfully');
  console.log('📋 Configuration summary:');
  console.log(`   - Port: ${config.port}`);
  console.log(`   - WhatsApp Provider: ${config.whatsappProvider}`);
  console.log(`   - OTP TTL: ${config.otpTtlMinutes} minutes`);
  console.log(`   - Max Attempts: ${config.maxOtpAttempts}`);
  console.log(`   - HMAC Secret: ${config.hmacSecret.substring(0, 10)}...`);
  console.log('✅ All required environment variables are set! 🎉');

} catch (error) {
  console.error('❌ Configuration test failed:', error.message);
  if (error.issues) {
    console.error('Missing environment variables:');
    error.issues.forEach(issue => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
  }
  process.exit(1);
}