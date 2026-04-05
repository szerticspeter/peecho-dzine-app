/**
 * Direct Cloudinary upload test
 * This lets you test the upload without the full app
 */

import https from 'https';
import fs from 'fs';

// You need to provide these
const CLOUD_NAME = 'your_cloud_name';       // From Cloudinary console
const UPLOAD_PRESET = 'your_preset_name';   // From preset settings
const TEST_IMAGE_PATH = './test-image.jpg'; // Or use built-in test image

async function uploadToCloudinary(imagePath, cloudName, uploadPreset) {
  console.log('═'.repeat(80));
  console.log('  DIRECT CLOUDINARY UPLOAD TEST');
  console.log('═'.repeat(80) + '\n');

  console.log('📝 Configuration:');
  console.log(`   Cloud Name: ${cloudName}`);
  console.log(`   Upload Preset: ${uploadPreset}`);
  console.log(`   Image: ${imagePath}\n`);

  // Read image file
  let imageData;
  if (fs.existsSync(imagePath)) {
    console.log('✅ Found image file');
    const fileContent = fs.readFileSync(imagePath);
    imageData = fileContent.toString('base64');
    console.log(`   Size: ${fileContent.length} bytes\n`);
  } else {
    console.log('⚠️  Image file not found, using tiny test image\n');
    // Use the same tiny base64 image from before
    imageData = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';
  }

  // Build form data
  const boundary = '----WebKitFormBoundary' + Date.now();
  let body = '';

  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="file"\r\n';
  body += 'Content-Type: image/jpeg\r\n\r\n';
  body += imageData + '\r\n';

  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="upload_preset"\r\n\r\n';
  body += uploadPreset + '\r\n';

  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="folder"\r\n\r\n';
  body += 'dzine-orders\r\n';

  body += `--${boundary}--\r\n`;

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  console.log(`🌐 Uploading to: ${url}\n`);

  return new Promise((resolve) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    console.log('📤 Sending request...\n');

    const req = https.request(url, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log(`📊 Response Status: ${res.statusCode} ${res.statusMessage}\n`);

        try {
          const json = JSON.parse(responseData);
          
          if (res.statusCode === 200) {
            console.log('✅ SUCCESS!\n');
            console.log('Image Details:');
            console.log(`  Public ID: ${json.public_id}`);
            console.log(`  URL: ${json.url}`);
            console.log(`  Secure URL: ${json.secure_url}`);
            console.log(`  Format: ${json.format}`);
            console.log(`  Width: ${json.width}`);
            console.log(`  Height: ${json.height}`);
            console.log(`  Size: ${json.bytes} bytes\n`);
          } else {
            console.log('❌ UPLOAD FAILED\n');
            console.log('Error Details:');
            console.log(`  Error Code: ${json.error?.code}`);
            console.log(`  Error Message: ${json.error?.message}`);
            if (json.error?.parameters) {
              console.log(`  Parameters: ${JSON.stringify(json.error.parameters)}`);
            }
            console.log('\nFull Response:');
            console.log(JSON.stringify(json, null, 2));
          }
        } catch (e) {
          console.log('Response (not JSON):');
          console.log(responseData);
        }

        console.log('\n' + '═'.repeat(80) + '\n');
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error.message);
      resolve();
    });

    req.write(body);
    req.end();
  });
}

// Main
console.log('\n');
console.log('╔' + '═'.repeat(78) + '╗');
console.log('║' + ' '.repeat(20) + 'CLOUDINARY UPLOAD TESTER' + ' '.repeat(34) + '║');
console.log('╚' + '═'.repeat(78) + '╝\n');

console.log('HOW TO USE:');
console.log('───────────\n');
console.log('1. Edit this file and change:');
console.log('   const CLOUD_NAME = "your_cloud_name"');
console.log('   const UPLOAD_PRESET = "your_preset_name"\n');
console.log('2. Optionally provide a real image:');
console.log('   const TEST_IMAGE_PATH = "./path/to/image.jpg"\n');
console.log('3. Run: node test-cloudinary-upload.js\n');
console.log('This will test if Cloudinary can accept uploads from your preset.\n');

console.log('═'.repeat(80));
console.log('\nDefaults (will fail unless you update them):');
console.log(`  Cloud Name: ${CLOUD_NAME}`);
console.log(`  Upload Preset: ${UPLOAD_PRESET}\n`);

if (CLOUD_NAME === 'your_cloud_name' || UPLOAD_PRESET === 'your_preset_name') {
  console.log('⚠️  EDIT THIS FILE FIRST with your actual credentials!\n');
  console.log('Then run again: node test-cloudinary-upload.js\n');
} else {
  // Run the test
  await uploadToCloudinary(TEST_IMAGE_PATH, CLOUD_NAME, UPLOAD_PRESET);
}
