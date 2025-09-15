require('dotenv').config();
const { uploadToCloud, deleteFromCloud, getCloudinaryUsage } = require('./dist/services/cloudStorage');

async function testCloudinary() {
  try {
    console.log('Testing Cloudinary connection...');
    
    // Test 1: Get usage info
    console.log('\n1. Getting Cloudinary usage info:');
    const usage = await getCloudinaryUsage();
    console.log('Usage:', usage);
    
    console.log('\nCloudinary connection successful!');
    
  } catch (error) {
    console.error('Cloudinary test failed:', error.message);
    console.log('Please check your Cloudinary credentials in the .env file');
    process.exit(1);
  }
}

testCloudinary();