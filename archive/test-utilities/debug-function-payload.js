/**
 * This script shows exactly what the saveEditedImage function is sending to Cloudinary
 * Helps debug why Cloudinary returns 500
 */

import { handler } from './netlify/functions/saveEditedImage.mjs';

// Intercept fetch to log what's being sent
const originalFetch = global.fetch;
let requestLog = {
  url: null,
  method: null,
  body: null,
  headers: null,
  response: null
};

global.fetch = async (...args) => {
  const [url, options] = args;
  
  // Log the request
  requestLog.url = url;
  requestLog.method = options?.method || 'GET';
  requestLog.headers = options?.headers;
  requestLog.body = options?.body;
  
  // Call the original fetch
  return originalFetch(...args);
};

// Test with a real base64 image
async function testFunction() {
  console.log('═'.repeat(80));
  console.log('  FUNCTION PAYLOAD DEBUGGING');
  console.log('═'.repeat(80) + '\n');

  // Create a small but realistic base64 JPEG
  // This is a real 100x100 JPEG image
  const testBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

  console.log('🧪 Testing saveEditedImage function\n');
  console.log('Input:');
  console.log(`  Image: Base64 JPEG (data:image/jpeg;base64,...)`);
  console.log(`  Length: ${testBase64.length} characters`);
  console.log(`  Size: ~${Math.round(testBase64.length * 0.75 / 1024)} KB\n`);

  // Call the function
  const mockEvent = {
    httpMethod: 'POST',
    body: JSON.stringify({
      imageData: testBase64
    })
  };

  try {
    console.log('Calling handler...\n');
    const response = await handler(mockEvent);

    console.log('📊 Function Response:');
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Body: ${response.body}\n`);

    // Log what was sent to Cloudinary
    if (requestLog.url) {
      console.log('📤 Request Sent to Cloudinary:');
      console.log(`   URL: ${requestLog.url}`);
      console.log(`   Method: ${requestLog.method}`);
      console.log(`   Headers:`, requestLog.headers);
      
      if (requestLog.body) {
        const urlParams = new URLSearchParams(requestLog.body);
        console.log('\n   Body (URLSearchParams):');
        for (const [key, value] of urlParams) {
          if (key === 'file') {
            console.log(`     ${key}: [base64 image, length: ${value.length}]`);
            // Show first 100 chars
            console.log(`            (starts with: "${value.substring(0, 100)}...")`);
          } else {
            console.log(`     ${key}: "${value}"`);
          }
        }
      }
      
      if (requestLog.response) {
        console.log('\n   Response:');
        console.log(`     Status: ${requestLog.response.status}`);
        console.log(`     Body: ${requestLog.response.body}`);
      }
    }

  } catch (error) {
    console.error('Function error:', error.message);
  }

  console.log('\n' + '═'.repeat(80) + '\n');
}

console.log('\n');
testFunction();
