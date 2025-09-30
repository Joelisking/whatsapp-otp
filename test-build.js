#!/usr/bin/env node

// Simple script to test that the build works
console.log('Testing WhatsApp OTP Service build...');

try {
  // Test that the compiled JavaScript can be loaded
  const fs = require('fs');
  const path = require('path');

  // Check if dist directory exists
  if (!fs.existsSync('./dist')) {
    console.error('❌ Build directory does not exist');
    process.exit(1);
  }

  // Check if main files exist
  const mainFiles = ['index.js', 'app.js'];
  for (const file of mainFiles) {
    const filePath = path.join('./dist', file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ ${file} does not exist in build`);
      process.exit(1);
    }
  }

  console.log('✅ All build files exist');

  // Test that modules can be required (basic syntax check)
  try {
    delete require.cache[require.resolve('./dist/app.js')];
    const { createApp } = require('./dist/app.js');

    if (typeof createApp !== 'function') {
      console.error('❌ createApp is not a function');
      process.exit(1);
    }

    console.log('✅ Main modules can be loaded');
    console.log('✅ Build test passed! 🎉');

  } catch (error) {
    console.error('❌ Error loading modules:', error.message);
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Build test failed:', error.message);
  process.exit(1);
}