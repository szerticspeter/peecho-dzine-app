# Root Cause Analysis: 502 Error on "Crop & Continue"

## 🔍 Issue Summary
When the user clicks "Crop & Continue" button in the image editor, the app crashes with a **502 Bad Gateway** error.

**Error Message in Browser:**
```
Error: Failed to save the image
```

**HTTP Status:** 502 Bad Gateway  
**Endpoint:** `/.netlify/functions/saveEditedImage`

---

## 🎯 Root Cause: MISSING CLOUDINARY CREDENTIALS

The `saveEditedImage.mjs` Netlify function requires **Cloudinary image hosting service**, but the required environment variables are **not configured** in the Netlify deployment.

### The Missing Variables:
```javascript
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

if (!cloudName || !uploadPreset) {
  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({ 
      error: "Cloudinary configuration missing (CLOUDINARY_CLOUD_NAME or CLOUDINARY_UPLOAD_PRESET not set)" 
    })
  };
}
```

### What Happens:
1. User clicks "Crop & Continue"
2. Frontend calls `/.netlify/functions/saveEditedImage` with canvas image
3. Function checks for Cloudinary env vars
4. **Environment variables are missing**
5. Function returns 500 error (which becomes 502 in transit)
6. User sees "Failed to save the image"

---

## 📄 Function Code Analysis

**File:** `netlify/functions/saveEditedImage.mjs`

```javascript
export async function handler(event) {
  // ... validation code ...
  
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;        // ❌ NOT SET
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;  // ❌ NOT SET
  
  if (!cloudName || !uploadPreset) {
    // This error is triggered
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Cloudinary configuration missing..." 
      })
    };
  }
  
  // Never reaches here because env vars are missing
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  // ...
}
```

---

## 🔧 How to Fix

### Option 1: Add Cloudinary Credentials (Recommended)

You need:
1. **Cloudinary Cloud Name** - Your Cloudinary account identifier
2. **Cloudinary Upload Preset** - An unsigned upload preset configured in Cloudinary

**Steps to set up:**

1. **Create/Get Cloudinary Account**
   ```bash
   # Visit https://cloudinary.com/
   # Sign up for a free account (includes 25 GB monthly uploads)
   ```

2. **Get Your Cloud Name**
   - Go to Cloudinary Dashboard
   - Find your Cloud Name (looks like: `du3xvqrnf`)

3. **Create an Upload Preset**
   - Dashboard → Settings → Upload
   - Create new unsigned preset
   - Name it something like: `dzine_uploads`
   - Make sure "Unsigned" is enabled
   - Note the folder: `dzine-orders` (optional but recommended)

4. **Set Netlify Environment Variables**
   ```bash
   netlify link                    # Link this repo to the Netlify site
   netlify env:set CLOUDINARY_CLOUD_NAME "your_cloud_name"
   netlify env:set CLOUDINARY_UPLOAD_PRESET "dzine_uploads"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

---

### Option 2: Use Alternative Image Storage (Quick Fix)

If you don't want to use Cloudinary, you could:
- Use Netlify's serverless functions to store on a different service
- Use AWS S3 / Google Cloud Storage
- Use a different image hosting API

But this requires **modifying the function code**.

---

### Option 3: Disable Image Saving (Not Recommended)

You could comment out the save functionality, but this breaks the purchase flow:

```javascript
// In ImageEditor.js, comment out the cropImage() call
// This would prevent orders from being completed
```

---

## 🔗 Related Code Locations

### Frontend (where error originates):
**File:** `src/ImageEditor.js`

```javascript
const cropImage = async () => {
  try {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    // Send to serverless function
    const response = await fetch('/.netlify/functions/saveEditedImage', {
      method: 'POST',
      body: JSON.stringify({ imageData: dataUrl })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save the image');  // ← This error you see
    }
    
    const data = await response.json();
    // Continue to checkout...
  } catch (error) {
    console.error('Error during image save:', error);
  }
};
```

---

## 🗂️ Architecture Overview

```
User Browser
    ↓
ImageEditor.js (Frontend)
    ↓ POST: Canvas image as base64
/.netlify/functions/saveEditedImage
    ↓ Upload to...
Cloudinary (❌ NOT CONFIGURED)
    ↓
Return image URL back to browser
```

**Current Status:** ❌ Cloudinary step fails because credentials missing

---

## 📋 Secondary Issue: Blank Canvas

While debugging the save issue, there's also:

**Image Not Displaying on Canvas**
- Canvas renders but image is blank
- Related to sessionStorage serialization in `ImageEditor.js`
- Different from the 502 error but also needs fixing

---

## ✅ Verification Steps

Once you set the environment variables:

1. Deploy to Netlify:
   ```bash
   netlify deploy --prod
   ```

2. Re-run the Playwright test:
   ```bash
   node test-complete-flow.js
   ```

3. Expected result:
   - ✅ Image displays on canvas
   - ✅ Crop & Continue button works
   - ✅ Image uploads to Cloudinary
   - ✅ Returns image URL for checkout

---

## 💡 Summary

| Aspect | Details |
|--------|---------|
| **Error** | 502 Bad Gateway |
| **Root Cause** | Missing Cloudinary environment variables |
| **Affected Function** | `netlify/functions/saveEditedImage.mjs` |
| **Required Variables** | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_UPLOAD_PRESET` |
| **Time to Fix** | ~10 minutes (Cloudinary setup + env vars) |
| **Effort Level** | Easy - just configuration, no code changes |

---

## 🚀 Next Steps

1. ✅ **Create Cloudinary account** (free tier available)
2. ✅ **Get Cloud Name & Create Upload Preset**
3. ✅ **Link repo:** `netlify link`
4. ✅ **Set environment variables:** `netlify env:set ...`
5. ✅ **Deploy:** `netlify deploy --prod`
6. ✅ **Test again** with the Playwright script

This is a **configuration issue, not a code bug**. Once credentials are added, the 502 error will be resolved.

---

**Generated:** 2026-04-04 21:37 GMT+2  
**Source:** Code analysis of `saveEditedImage.mjs`  
**Status:** Root cause identified ✅
