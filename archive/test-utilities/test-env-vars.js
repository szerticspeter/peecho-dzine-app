/**
 * Test if Netlify environment variables are accessible
 * without running the full app
 */

const http = require('http');
const https = require('https');

// Test 1: Call the live endpoint with minimal test data
async function testLiveEndpoint() {
  console.log('🧪 TEST 1: Call live Netlify function\n');
  console.log('Endpoint: https://peecho-dzine-app.netlify.app/.netlify/functions/saveEditedImage');
  console.log('Method: POST');
  console.log('Payload: Small base64 test image\n');

  // Create a tiny test image (100x100 white pixel)
  const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

  return new Promise((resolve) => {
    const url = 'https://peecho-dzine-app.netlify.app/.netlify/functions/saveEditedImage';
    const parsedUrl = new URL(url);

    const postData = JSON.stringify({
      imageData: testImage
    });

    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`📊 Response Status: ${res.statusCode}`);
        console.log(`📊 Response Headers:`, res.headers);
        console.log(`📊 Response Body:\n${data}\n`);

        try {
          const json = JSON.parse(data);
          console.log('📝 Parsed JSON:');
          console.log(JSON.stringify(json, null, 2));
          
          if (json.error) {
            console.log(`\n🔴 Error message: ${json.error}`);
            
            // Analyze the error
            if (json.error.includes('Cloudinary configuration missing')) {
              console.log('   → Environment variables NOT accessible');
            } else if (json.error.includes('Cloudinary upload failed')) {
              console.log('   → Environment variables ARE accessible, but Cloudinary API failed');
              console.log('   → Check Cloudinary Cloud Name or Upload Preset');
            }
          } else if (json.success) {
            console.log('\n✅ SUCCESS! Function can access Cloudinary credentials');
          }
        } catch (e) {
          console.log('Could not parse as JSON');
        }

        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

// Test 2: Try to import and run the function locally
async function testLocalFunction() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST 2: Import function locally (requires Node.js ESM)\n');

  try {
    // Try to import the handler
    const { handler } = await import('./netlify/functions/saveEditedImage.mjs');
    console.log('✅ Function imported successfully\n');

    // Create mock event
    const mockEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k='
      })
    };

    console.log('🔍 Checking environment variables:\n');
    console.log(`   CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   CLOUDINARY_UPLOAD_PRESET: ${process.env.CLOUDINARY_UPLOAD_PRESET ? '✅ SET' : '❌ NOT SET'}\n`);

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_UPLOAD_PRESET) {
      console.log('⚠️  Environment variables not found in local Node.js process');
      console.log('   (This is expected - they should be set in Netlify, not locally)\n');
    }

    console.log('Calling handler with mock event...\n');
    const response = await handler(mockEvent);

    console.log('📊 Response Status:', response.statusCode);
    console.log('📊 Response Body:', response.body);

    try {
      const bodyJson = JSON.parse(response.body);
      if (bodyJson.error) {
        console.log(`\n🔴 Error: ${bodyJson.error}`);
      } else if (bodyJson.success) {
        console.log('\n✅ SUCCESS!');
      }
    } catch (e) {
      // Not JSON
    }

  } catch (error) {
    console.log('❌ Could not import function locally');
    console.log(`   Error: ${error.message}`);
    console.log('\n   This is fine - the function will run on Netlify servers\n');
  }
}

// Run tests
(async () => {
  console.log('\n' + '═'.repeat(80));
  console.log('  ENVIRONMENT VARIABLE ACCESSIBILITY TEST');
  console.log('═'.repeat(80) + '\n');

  await testLiveEndpoint();
  await testLocalFunction();

  console.log('\n' + '═'.repeat(80));
  console.log('✅ TEST COMPLETE\n');
})();
