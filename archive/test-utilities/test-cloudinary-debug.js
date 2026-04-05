/**
 * Debug what the function is actually sending to Cloudinary
 * and check if credentials are valid
 */

import { handler } from './netlify/functions/saveEditedImage.mjs';
import fs from 'fs';

async function testCloudinaryCall() {
  console.log('═'.repeat(80));
  console.log('  CLOUDINARY CREDENTIAL & API TEST');
  console.log('═'.repeat(80) + '\n');

  // First, log what env vars are set on Netlify (during test)
  console.log('🔍 Environment Variables in Node.js:\n');
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  
  console.log(`   CLOUDINARY_CLOUD_NAME: ${cloudName ? '✅ SET to: ' + cloudName : '❌ NOT SET'}`);
  console.log(`   CLOUDINARY_UPLOAD_PRESET: ${uploadPreset ? '✅ SET to: ' + uploadPreset : '❌ NOT SET'}\n`);

  // Try to check if they're in .env file
  console.log('🔍 Checking for .env file...');
  if (fs.existsSync('.env')) {
    console.log('   ✅ .env file exists\n');
    const envContent = fs.readFileSync('.env', 'utf-8');
    const lines = envContent.split('\n').filter(l => l.includes('CLOUDINARY'));
    if (lines.length > 0) {
      console.log('   📝 Cloudinary lines in .env:');
      lines.forEach(line => {
        if (line.trim()) {
          const [key, value] = line.split('=');
          if (value && value.trim()) {
            const masked = value.substring(0, 5) + '...' + value.substring(value.length - 3);
            console.log(`      ${key}=${masked}`);
          }
        }
      });
    } else {
      console.log('   ❌ No Cloudinary variables in .env\n');
    }
  } else {
    console.log('   ❌ .env file not found\n');
  }

  if (!cloudName || !uploadPreset) {
    console.log('\n⚠️  IMPORTANT: Environment variables are NOT visible in Node.js process');
    console.log('   This is EXPECTED - they should be set on Netlify, not locally.\n');
    console.log('   To verify they exist on Netlify:');
    console.log('   → netlify link  (link repo to site)');
    console.log('   → netlify env:list  (check if vars are there)');
    console.log('\n   But we already know they ARE set (test 1 showed Cloudinary API was reached)\n');
    return;
  }

  // Test what happens when we call the function
  console.log('📝 Testing saveEditedImage function...\n');

  // Smaller test image for debugging
  const testImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

  const mockEvent = {
    httpMethod: 'POST',
    body: JSON.stringify({
      imageData: testImageData
    })
  };

  try {
    console.log('   Calling handler locally...\n');
    const response = await handler(mockEvent);

    console.log(`📊 Response Status: ${response.statusCode}`);
    console.log(`📊 Response Body:\n${response.body}\n`);

    const body = JSON.parse(response.body);

    if (response.statusCode === 200) {
      console.log('✅ SUCCESS! Image uploaded to Cloudinary');
      console.log(`   Image URL: ${body.imageUrl}`);
    } else {
      console.log('❌ FAILED\n');
      console.log(`Error: ${body.error}\n`);

      // Analyze the error
      if (body.error.includes('Cloudinary upload failed: 500')) {
        console.log('🔴 Analysis: Cloudinary returned HTTP 500\n');
        console.log('Possible causes:');
        console.log('  1. Invalid upload preset name (doesn\'t exist in account)');
        console.log('  2. Upload preset is signed but we\'re using unsigned');
        console.log('  3. Upload preset has restrictions rejecting this request');
        console.log('  4. Cloudinary API limit exceeded or account issue');
        console.log('  5. Base64 image format not accepted by preset\n');
        
        console.log('Suggested fixes:');
        console.log('  1. Verify preset exists: Cloudinary Dashboard → Settings → Upload');
        console.log('  2. Ensure preset is "Unsigned"');
        console.log('  3. Check if preset allows unsigned uploads');
        console.log('  4. Try uploading a file URL instead of base64\n');
      } else if (body.error.includes('configuration missing')) {
        console.log('🔴 Analysis: Environment variables not set\n');
      }
    }

  } catch (error) {
    console.error('Function threw error:', error.message);
  }

  console.log('═'.repeat(80) + '\n');
}

// Run test
(async () => {
  await testCloudinaryCall();
  
  console.log('\n📌 CONCLUSION:\n');
  console.log('The error "Cloudinary upload failed: 500" means:');
  console.log('  ✅ Netlify function CAN access the environment variables');
  console.log('  ✅ Function CAN reach Cloudinary API');
  console.log('  ❌ Cloudinary is rejecting the upload request\n');
  console.log('Next step: Check Cloudinary credentials validity\n');
})();
