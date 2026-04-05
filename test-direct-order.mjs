#!/usr/bin/env node

/**
 * test-direct-order.mjs
 * ──────────────────────────────────────────────────────────────────────────
 * Test app for Peecho Direct Order API (on-the-fly product creation)
 * 
 * Flow:
 *   1. Load image from ~/Downloads/woman-sitting-on-blanket-park-260nw-2678672257.webp
 *   2. Upload to Cloudinary (requires CLOUDINARY_CLOUD_NAME + CLOUDINARY_UPLOAD_PRESET)
 *   3. Create Peecho order with the Cloudinary image URL
 *   4. Log all details: request body, response, order ID, etc.
 * 
 * Usage:
 *   1. Set environment variables:
 *      export CLOUDINARY_CLOUD_NAME=<your-cloud-name>
 *      export CLOUDINARY_UPLOAD_PRESET=<your-preset-name>
 *      export PEECHO_MERCHANT_KEY=<your-merchant-key>
 *      export PEECHO_PUBLICATION_ID=<your-publication-id>
 *   
 *   2. Run the test:
 *      node test-direct-order.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream } from 'fs';

// ─── Setup ──────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  PEECHO_MERCHANT_KEY,
  PEECHO_PUBLICATION_ID,
} = process.env;

// ─── Logging helpers ────────────────────────────────────────────────────────

function log(label, data) {
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`📝 ${label}`);
  console.log('─'.repeat(80));
  if (typeof data === 'string') {
    console.log(data);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

function success(msg) {
  console.log(`\n✅ ${msg}`);
}

function error(msg) {
  console.log(`\n❌ ${msg}`);
}

function section(title) {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`  ${title}`);
  console.log('═'.repeat(80));
}

// ─── Validation ─────────────────────────────────────────────────────────────

section('ENVIRONMENT VARIABLES CHECK');

const required = {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  PEECHO_MERCHANT_KEY,
  PEECHO_PUBLICATION_ID,
};

let allPresent = true;
for (const [key, value] of Object.entries(required)) {
  if (value) {
    // Show first few chars for security
    const display = value.length > 20 ? value.substring(0, 10) + '...' + value.substring(value.length - 5) : value;
    console.log(`✅ ${key}: ${display}`);
  } else {
    console.log(`❌ ${key} - MISSING`);
    allPresent = false;
  }
}

if (!allPresent) {
  console.log('\n⚠️  MISSING ENVIRONMENT VARIABLES!');
  console.log('\n📋 How to get credentials:\n');
  console.log('1. CLOUDINARY_CLOUD_NAME & CLOUDINARY_UPLOAD_PRESET:');
  console.log('   - Go to https://cloudinary.com/console');
  console.log('   - Your Cloud Name is at the top of the page');
  console.log('   - Settings → Upload → Find your unsigned preset');
  console.log('   - Note: The preset must be set to "Unsigned"\n');
  
  console.log('2. PEECHO_MERCHANT_KEY & PEECHO_PUBLICATION_ID:');
  console.log('   - Go to https://www.peecho.com/account/dashboard');
  console.log('   - Settings → API Keys → Your Merchant Key');
  console.log('   - Your Publication ID is the ID of your product\n');

  console.log('📥 Set them like this:\n');
  console.log('  export CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('  export CLOUDINARY_UPLOAD_PRESET=your_preset_name');
  console.log('  export PEECHO_MERCHANT_KEY=your_merchant_key');
  console.log('  export PEECHO_PUBLICATION_ID=your_publication_id\n');
  console.log('  Then run: node test-direct-order.mjs\n');
  process.exit(1);
}

success('All environment variables are set!');

// ─── Image Loading ──────────────────────────────────────────────────────────

section('STEP 1: LOAD IMAGE FROM DOWNLOADS');

const imagePath = path.join(process.env.HOME, 'Downloads', 'woman-sitting-on-blanket-park-260nw-2678672257.webp');

log('Image Path', imagePath);

if (!fs.existsSync(imagePath)) {
  error(`Image not found at ${imagePath}`);
  console.log('\nTrying alternative image paths...');
  
  const altPaths = [
    path.join(process.env.HOME, 'Downloads', 'woman-sitting-on-blanket-park-260nw-2678672257.jpeg'),
    path.join(process.env.HOME, 'Downloads', '*.webp'),
  ];
  
  for (const altPath of altPaths) {
    if (fs.existsSync(altPath)) {
      console.log(`Found alternative: ${altPath}`);
    }
  }
  
  process.exit(1);
}

const imageBuffer = fs.readFileSync(imagePath);
const imageSizeMB = (imageBuffer.length / 1024 / 1024).toFixed(2);
const imageSizeKB = (imageBuffer.length / 1024).toFixed(2);

success(`Image loaded successfully (${imageSizeKB} KB)`);
log('Image Details', {
  path: imagePath,
  sizeBytes: imageBuffer.length,
  sizeKB: imageSizeKB,
  format: 'webp',
});

// ─── Cloudinary Upload ──────────────────────────────────────────────────────

section('STEP 2: UPLOAD TO CLOUDINARY');

async function uploadToCloudinary() {
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  // Create FormData with file blob
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: 'image/webp' });
  formData.append('file', blob, 'image.webp');
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'dzine-orders');

  log('Cloudinary Upload Request', {
    url: cloudinaryUrl,
    method: 'POST',
    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
    folder: 'dzine-orders',
    fileSize: `${imageSizeKB} KB`,
  });

  try {
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
    });

    log('Cloudinary Upload Response Status', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    const responseData = await response.json();

    if (!response.ok) {
      log('Cloudinary Error Response', responseData);
      error(`Cloudinary upload failed with status ${response.status}`);
      console.log('\n💡 Possible causes:');
      console.log('  1. Upload preset does not exist or is invalid');
      console.log('  2. Upload preset is not set to "Unsigned"');
      console.log('  3. Upload preset resource type not set to "Image"');
      console.log('  4. Upload preset format whitelist excludes WEBP');
      console.log('  5. Cloudinary account rate limit exceeded');
      console.log('\n🔧 To fix:');
      console.log('  - Go to https://cloudinary.com/console/settings/upload');
      console.log('  - Click on your preset');
      console.log('  - Ensure "Unsigned" is enabled');
      console.log('  - Ensure "Image" resource type is checked');
      console.log('  - Ensure "Allowed formats" is empty or includes webp');
      return null;
    }

    log('Cloudinary Upload Response Data', responseData);

    const imageUrl = responseData.secure_url;
    success(`Image uploaded to Cloudinary`);

    return {
      cloudinaryUrl: imageUrl,
      publicId: responseData.public_id,
      format: responseData.format,
    };
  } catch (err) {
    error(`Cloudinary upload error: ${err.message}`);
    log('Error Details', err);
    return null;
  }
}

const cloudinaryResult = await uploadToCloudinary();

if (!cloudinaryResult) {
  error('Failed to upload image to Cloudinary. Aborting order creation.');
  process.exit(1);
}

// ─── Peecho Order Creation ──────────────────────────────────────────────────

section('STEP 3: CREATE PEECHO ORDER');

async function createPeechoOrder(imageUrl) {
  const orderPayload = {
    imageUrl,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    address: '123 Test Street',
    city: 'Budapest',
    postCode: '1000',
    country: 'HU',
    currency: 'EUR',
  };

  log('Peecho Order Request Payload', orderPayload);

  try {
    // Step 1: Create order
    console.log('\n📌 Peecho API Step 1: Create Order');
    const peechoBaseUrl = 'https://www.peecho.com/checkout/uplift';
    const createUrl = `${peechoBaseUrl}/order/create`;
    const createBody = {
      publicationId: PEECHO_PUBLICATION_ID,
      geolocation: { countryCode: 'HU' },
      quantity: 1,
      currency: 'EUR',
    };

    log('Create Order Request', {
      url: createUrl,
      method: 'POST',
      body: createBody,
    });

    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createBody),
    });

    log('Create Order Response Status', {
      status: createResponse.status,
      statusText: createResponse.statusText,
      ok: createResponse.ok,
    });

    let createData;
    try {
      createData = await createResponse.json();
    } catch {
      createData = await createResponse.text();
    }
    log('Create Order Response Data', createData);

    if (!createResponse.ok) {
      error(`Peecho order creation failed with status ${createResponse.status}`);
      console.log('\n💡 Possible causes:');
      console.log('  1. Invalid PEECHO_PUBLICATION_ID');
      console.log('  2. Peecho API temporary issue');
      console.log('  3. Invalid country code (HU used, change if needed)');
      return null;
    }

    const orderId = createData.orderId || createData.order_id;
    if (!orderId) {
      error('Peecho did not return an orderId');
      log('Response data', createData);
      return null;
    }

    success(`Order created with ID: ${orderId}`);

    // Step 2: Update order with address and image
    console.log('\n📌 Peecho API Step 2: Update Order with Address & Image');
    const updateUrl = `${peechoBaseUrl}/order/update`;
    const updateBody = {
      orderId,
      currency: 'EUR',
      imageUrl,
      shippingAddress: {
        firstName: orderPayload.firstName,
        lastName: orderPayload.lastName,
        addressLine1: orderPayload.address,
        zipCode: orderPayload.postCode,
        city: orderPayload.city,
        countryCode: orderPayload.country,
        state: '',
        companyName: '',
        addressLine2: '',
        phoneNumber: '',
        email: orderPayload.email,
      },
      address: {
        shippingAddress: {
          firstName: orderPayload.firstName,
          lastName: orderPayload.lastName,
          addressLine1: orderPayload.address,
          zipCode: orderPayload.postCode,
          city: orderPayload.city,
          countryCode: orderPayload.country,
          state: '',
          companyName: '',
          addressLine2: '',
          phoneNumber: '',
          email: orderPayload.email,
        },
        hasBilling: false,
      },
    };

    log('Update Order Request', {
      url: updateUrl,
      method: 'PUT',
      body: updateBody,
    });

    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateBody),
    });

    log('Update Order Response Status', {
      status: updateResponse.status,
      statusText: updateResponse.statusText,
      ok: updateResponse.ok,
    });

    if (!updateResponse.ok) {
      let updateData;
      try {
        updateData = await updateResponse.json();
      } catch {
        updateData = await updateResponse.text();
      }
      log('Update Order Error Response', updateData);
      error(`Peecho order update failed with status ${updateResponse.status}`);
      return null;
    }

    success(`Order updated with address and image`);

    // Step 3: Generate checkout URL
    const checkoutUrl =
      `https://www.peecho.com/configurator/checkout` +
      `?publicationId=${encodeURIComponent(PEECHO_PUBLICATION_ID)}` +
      `&orderId=${encodeURIComponent(orderId)}` +
      `&currency=EUR`;

    return {
      orderId,
      checkoutUrl,
      imageUrl,
    };
  } catch (err) {
    error(`Peecho order creation error: ${err.message}`);
    log('Error Details', err);
    return null;
  }
}

const peechoResult = await createPeechoOrder(cloudinaryResult.cloudinaryUrl);

// ─── Final Report ───────────────────────────────────────────────────────────

section('FINAL REPORT');

if (!peechoResult) {
  error('Order creation FAILED!');
  console.log('\n🔍 Troubleshooting checklist:');
  console.log('  □ CLOUDINARY_UPLOAD_PRESET is valid');
  console.log('  □ Preset is set to "Unsigned"');
  console.log('  □ Preset resource type includes "Image"');
  console.log('  □ PEECHO_PUBLICATION_ID is correct');
  console.log('  □ Your Peecho account is active');
  console.log('  □ Your Cloudinary account is active');
  process.exit(1);
}

success('Order creation SUCCEEDED!');

log('Order Details', {
  orderId: peechoResult.orderId,
  checkoutUrl: peechoResult.checkoutUrl,
  imageUrl: peechoResult.imageUrl,
  cloudinaryPublicId: cloudinaryResult.publicId,
});

console.log('\n📋 TEST SUMMARY:');
console.log('─'.repeat(80));
console.log(`✅ Step 1: Image loaded from Downloads (${imageSizeKB} KB)`);
console.log(`✅ Step 2: Image uploaded to Cloudinary`);
console.log(`✅ Step 3: Peecho order created successfully`);
console.log('─'.repeat(80));
console.log(`\n🎉 SUCCESS! Order ID: ${peechoResult.orderId}`);
console.log(`\n🔗 Checkout Link: ${peechoResult.checkoutUrl}`);
console.log(`\n💾 Image URL: ${peechoResult.imageUrl}`);
console.log('\nYou can now proceed to checkout or integrate this into your app!');
