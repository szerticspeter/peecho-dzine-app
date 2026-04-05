# ✅ Before You Run the Test - Checklist

Use this checklist to make sure everything is ready.

---

## Step 1: Verify Image Exists

**Command:**
```bash
ls -lh ~/Downloads/woman-sitting-on-blanket-park-260nw-2678672257.webp
```

**Expected Output:**
```
-rw-rw-r-- 1 peter peter 37K Apr  4 22:41 woman-sitting-on-blanket-park-260nw-2678672257.webp
```

**Status:**
- [ ] File exists
- [ ] File size is reasonable (>1 KB)

---

## Step 2: Get Cloudinary Credentials

**Go to:** https://cloudinary.com/console

### 2a. Get Cloud Name

1. Open the console page
2. Look at the top - you'll see "Cloud Name: xyz123"
3. Copy the cloud name (just the value, no "Cloud Name:" prefix)

**Example:** `xyz123`

**Status:**
- [ ] Have cloud name
- [ ] Not shared with anyone

### 2b. Get Upload Preset

1. Click **Settings** (gear icon)
2. Click **Upload** tab
3. Scroll down to "Upload presets"
4. Look for a preset with "unsigned" label
5. Click on the preset name to view details
6. Verify these settings:
   - [ ] "Unsigned" toggle is **ON** ✅
   - [ ] "Image" resource type is **checked** ✅
   - [ ] No restrictive "Allowed formats" (or includes webp/jpg)

**Preset Name Example:** `dzine_upload`

**Status:**
- [ ] Have preset name
- [ ] Preset is set to "Unsigned"
- [ ] Preset has "Image" resource type enabled

---

## Step 3: Get Peecho Credentials

**Go to:** https://www.peecho.com/account/dashboard

### 3a. Get Merchant Key

1. Go to account dashboard
2. Look for **Settings** or **API** section
3. Find "Merchant Key" or "API Key"
4. Copy it (usually looks like: `merchant_12345...`)

**Status:**
- [ ] Have merchant key
- [ ] Keep it secret!

### 3b. Get Publication ID

1. Find your product in Peecho (Products section)
2. The Publication ID is shown in the product details
3. Usually a number like: `2196394`

**Ways to find it:**
- Product settings page
- Product list (might be in the URL or shown as ID)
- API documentation (your product's ID)

**Status:**
- [ ] Have publication ID
- [ ] Verified it's the right product

---

## Step 4: Set Environment Variables

**Open terminal and run:**

```bash
export CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
export CLOUDINARY_UPLOAD_PRESET="your_preset_name_here"
export PEECHO_MERCHANT_KEY="your_merchant_key_here"
export PEECHO_PUBLICATION_ID="your_publication_id_here"
```

**Example:**
```bash
export CLOUDINARY_CLOUD_NAME="xyz123"
export CLOUDINARY_UPLOAD_PRESET="dzine_upload"
export PEECHO_MERCHANT_KEY="merchant_key_abc123xyz"
export PEECHO_PUBLICATION_ID="2196394"
```

**Verify they're set:**
```bash
env | grep -E "CLOUDINARY|PEECHO"
```

**Expected Output:**
```
CLOUDINARY_CLOUD_NAME=xyz123
CLOUDINARY_UPLOAD_PRESET=dzine_upload
PEECHO_MERCHANT_KEY=merchant_key_abc123xyz
PEECHO_PUBLICATION_ID=2196394
```

**Status:**
- [ ] All 4 variables are set
- [ ] No typos in names
- [ ] Values are not wrapped in extra quotes

---

## Step 5: Verify Test Script Exists

**Command:**
```bash
ls -lh /home/peter/.openclaw/workspace/peecho-dzine-app/test-direct-order.mjs
```

**Expected Output:**
```
-rw-rw-r-- 1 peter peter 13K Apr  4 22:50 test-direct-order.mjs
```

**Status:**
- [ ] File exists
- [ ] File is readable

---

## Step 6: Check Node.js Version

**Command:**
```bash
node --version
```

**Expected Output:**
```
v18.0.0 or higher (e.g., v22.22.1)
```

**Status:**
- [ ] Node.js is installed
- [ ] Version is 18 or higher

---

## Step 7: Ready to Test

If all checkboxes above are checked ✅, you're ready!

**Run the test:**
```bash
cd /home/peter/.openclaw/workspace/peecho-dzine-app
node test-direct-order.mjs
```

---

## Common Issues BEFORE Running

### "I can't find my Cloudinary cloud name"

1. Go to https://cloudinary.com/console
2. It's right at the top of the page
3. Usually looks like: `my_company_name` or random string like `xyz123`

### "I don't have an unsigned upload preset"

1. Go to https://cloudinary.com/console/settings/upload
2. Look at the "Upload presets" list
3. If you don't see one:
   - Click "Add upload preset"
   - Name it: `dzine-upload`
   - Toggle "Unsigned" to ON
   - Click "Save"
4. Use that preset name

### "I can't find my Peecho publication ID"

1. Go to https://www.peecho.com/account/dashboard
2. Look for your product
3. ID might be in:
   - Product settings
   - Product URL (e.g., `/product/2196394`)
   - Product list view

### "I don't have a Peecho merchant key"

1. Go to https://www.peecho.com/account
2. Look for **API** or **Settings** section
3. If you don't see it, you might need to:
   - Create an API key
   - Check account permissions
   - Contact Peecho support

---

## If Everything is Set...

Run this command to verify everything one more time:

```bash
echo "Checking image..." && \
ls ~/Downloads/woman-sitting-on-blanket-park-260nw-2678672257.webp && \
echo "" && \
echo "Checking environment variables..." && \
env | grep -E "CLOUDINARY|PEECHO" && \
echo "" && \
echo "Checking Node.js..." && \
node --version && \
echo "" && \
echo "✅ Everything looks good! Ready to test."
```

If all checks pass, you're ready to run:

```bash
cd /home/peter/.openclaw/workspace/peecho-dzine-app && node test-direct-order.mjs
```

---

## What to Expect

**If test succeeds (5-10 seconds):**
```
✅ All environment variables are set!
✅ Image loaded successfully
✅ Image uploaded to Cloudinary
✅ Order created with ID: ord_abc123
✅ Order updated with address and image

🎉 SUCCESS! Order ID: ord_abc123
```

**If test fails, you'll see:**
```
❌ Cloudinary upload failed with status 500

💡 Possible causes:
  1. Upload preset does not exist...
  
🔧 To fix:
  - Go to https://cloudinary.com/console/settings/upload...
```

The script will tell you exactly what went wrong and how to fix it.

---

## Need Help?

1. **Check the detailed README:**
   ```bash
   cat /home/peter/.openclaw/workspace/peecho-dzine-app/TEST_DIRECT_ORDER_README.md
   ```

2. **Look at the summary:**
   ```bash
   cat /home/peter/.openclaw/workspace/peecho-dzine-app/DIRECT_ORDER_TEST_SUMMARY.md
   ```

3. **Run the test with full output:**
   ```bash
   node test-direct-order.mjs 2>&1 | tee test-output.txt
   # Then review test-output.txt for details
   ```

---

**You're all set! Proceed to Step 6 above when ready.** ✅
