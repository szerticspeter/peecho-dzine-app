# Test Direct Order - Peecho API Test

This is a comprehensive test application for the Peecho Direct Order API integration (on-the-fly product creation with Cloudinary image hosting).

## What It Does

1. **Loads an image** from `~/Downloads/woman-sitting-on-blanket-park-260nw-2678672257.webp`
2. **Uploads to Cloudinary** using your unsigned upload preset
3. **Creates a Peecho order** with the uploaded image URL
4. **Reports all details**: order ID, checkout URL, image URL, request bodies, responses

## Quick Start

### Option 1: Using Environment Variables (Recommended)

```bash
# Set your credentials
export CLOUDINARY_CLOUD_NAME=your_cloud_name
export CLOUDINARY_UPLOAD_PRESET=your_preset_name
export PEECHO_MERCHANT_KEY=your_merchant_key
export PEECHO_PUBLICATION_ID=your_publication_id

# Run the test
node test-direct-order.mjs
```

### Option 2: Link to Netlify (Requires `netlify` CLI)

If you've deployed to Netlify and want to use the environment variables from there:

```bash
# Link the repo to the Netlify site
netlify link

# The test will attempt to read from Netlify's env vars
node test-direct-order.mjs
```

## Getting Your Credentials

### Cloudinary Credentials

1. **Go to**: https://cloudinary.com/console
2. **Find Cloud Name**: It's displayed at the top of the console
3. **Find Upload Preset**:
   - Click **Settings** (gear icon)
   - Click **Upload** tab
   - Look for an "unsigned" preset
   - Note the preset name

**Important**: The preset MUST be:
- ✅ Set to "Unsigned" (unsigned uploads allowed)
- ✅ Have "Image" resource type enabled
- ✅ Have "webp" in allowed formats (or leave empty to allow all)

### Peecho Credentials

1. **Go to**: https://www.peecho.com/account/dashboard
2. **Find Merchant Key**:
   - Click **Settings** or **API**
   - Look for "Merchant Key" or "API Key"
3. **Find Publication ID**:
   - This is the ID of your product
   - Found in your product settings or product list
   - Format typically: `2196394` (just numbers)

## What Happens When You Run It

### Success Case ✅

```
════════════════════════════════════════════════════════════════════════════════
  ENVIRONMENT VARIABLES CHECK
════════════════════════════════════════════════════════════════════════════════
✅ CLOUDINARY_CLOUD_NAME: your_clo...dinary
✅ CLOUDINARY_UPLOAD_PRESET: dzine_upload
✅ PEECHO_MERCHANT_KEY: your_mer...hant_key
✅ PEECHO_PUBLICATION_ID: 2196394

[... Steps 1-3 execute ...]

════════════════════════════════════════════════════════════════════════════════
  FINAL REPORT
════════════════════════════════════════════════════════════════════════════════

✅ Order creation SUCCEEDED!

📝 Order Details
────────────────────────────────────────────────────────────────────────────────
{
  "orderId": "ord_12345abc",
  "checkoutUrl": "https://www.peecho.com/configurator/checkout?publicationId=2196394&orderId=ord_12345abc&currency=EUR",
  "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/dzine-orders/abc123.webp",
  "cloudinaryPublicId": "dzine-orders/abc123"
}

🎉 SUCCESS! Order ID: ord_12345abc
```

### Failure Case ❌

The script provides detailed troubleshooting information, for example:

```
❌ Cloudinary upload failed with status 500

💡 Possible causes:
  1. Upload preset does not exist or is invalid
  2. Upload preset is not set to "Unsigned"
  3. Upload preset resource type not set to "Image"
  4. Upload preset format whitelist excludes WEBP
  5. Cloudinary account rate limit exceeded

🔧 To fix:
  - Go to https://cloudinary.com/console/settings/upload
  - Click on your preset
  - Ensure "Unsigned" is enabled
  - Ensure "Image" resource type is checked
  - Ensure "Allowed formats" is empty or includes webp
```

## Detailed Step Breakdown

### Step 1: Load Image
- Reads the test image from Downloads
- Logs file size and format
- Exits if image not found

### Step 2: Upload to Cloudinary
- Creates a FormData payload with the image
- Uploads to `https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD_NAME}/image/upload`
- Uses your unsigned upload preset
- Returns Cloudinary secure_url for use in order

### Step 3: Create Peecho Order
- **Part 1**: POST to `/checkout/uplift/order/create` to get orderId
- **Part 2**: PUT to `/checkout/uplift/order/update` to attach address + image URL
- **Part 3**: Generates checkout URL for redirect

## Output Files & Logs

The script outputs to stdout, but you can redirect:

```bash
# Save full output to file
node test-direct-order.mjs > test-results.txt 2>&1

# Watch output in real-time while saving
node test-direct-order.mjs | tee test-results.txt
```

## Troubleshooting

### "Image not found"
- Check that the image exists: `ls ~/Downloads/woman-sitting-on-blanket-park-260nw-2678672257.webp`
- If missing, download it or use a different image

### "CLOUDINARY_CLOUD_NAME - MISSING"
- Run: `export CLOUDINARY_CLOUD_NAME=your_cloud_name` (see "Getting Your Credentials" above)

### "Cloudinary upload failed with status 500"
- Most common cause: Upload preset is not set to "Unsigned"
- Check your preset settings in https://cloudinary.com/console/settings/upload
- Ensure "Unsigned" toggle is ON
- Ensure "Image" resource type is checked

### "Peecho order creation failed with status 4xx"
- Check your PEECHO_PUBLICATION_ID is correct
- Verify your Peecho account is active
- Check that the product exists on your Peecho account

### "Peecho order creation failed with status 5xx"
- Peecho API may be having issues
- Try again in a few moments
- Check https://status.peecho.com for service status

## Integration with Your App

Once the test succeeds:

1. **Use the order ID**: The `orderId` from the response
2. **Redirect to checkout**: Use the `checkoutUrl` to send users to Peecho
3. **Store image URL**: Keep the Cloudinary image URL for records/refunds

## Example Integration

```javascript
// In your app after user edits image:
const testResult = {
  orderId: 'ord_12345abc',
  checkoutUrl: 'https://www.peecho.com/configurator/checkout?...',
  imageUrl: 'https://res.cloudinary.com/...'
};

// 1. Show order summary to user
console.log(`Your order: ${testResult.orderId}`);
console.log(`Image: ${testResult.imageUrl}`);

// 2. Redirect to Peecho checkout
window.location.href = testResult.checkoutUrl;

// 3. Backend: Save order details for fulfillment webhook
saveOrderToDatabase({
  orderId: testResult.orderId,
  imageUrl: testResult.imageUrl,
  timestamp: new Date(),
  status: 'pending_checkout'
});
```

## Files

- **test-direct-order.mjs** - Main test script
- **TEST_DIRECT_ORDER_README.md** - This file
- **netlify/functions/saveEditedImage.mjs** - Cloudinary upload helper
- **netlify/functions/createPeechoOrder.mjs** - Peecho order creation helper

## Testing the Full Flow

```bash
# 1. Make sure image exists
ls ~/Downloads/woman-sitting-on-blanket-park-260nw-2678672257.webp

# 2. Set credentials
export CLOUDINARY_CLOUD_NAME=my-cloud
export CLOUDINARY_UPLOAD_PRESET=dzine-preset
export PEECHO_MERCHANT_KEY=merchant123
export PEECHO_PUBLICATION_ID=2196394

# 3. Run test
node test-direct-order.mjs

# 4. Check output for success/failure
# Look for "🎉 SUCCESS" or "❌ Order creation FAILED"
```

## Next Steps

After successful test:

1. **Verify order** in Peecho dashboard: https://www.peecho.com/account/orders
2. **Complete checkout** using the provided URL to test the full flow
3. **Integrate** the flow into your React app (see `src/AddressForm.js`)

## Notes

- All test data uses dummy customer info (can be changed in the script)
- Test orders are real and will appear in your Peecho account
- Images are stored in the `dzine-orders/` folder on Cloudinary
- Currency is hardcoded to EUR (can be changed in the script)
- Country is hardcoded to HU (Hungary) - change as needed

---

**Created**: 2026-04-04  
**Status**: Pure PoC test - does not modify your main app code  
**Safe to use**: Yes - only reads from existing services, doesn't modify anything
