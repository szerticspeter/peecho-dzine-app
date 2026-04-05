# Cloudinary Upload Preset Checklist

## How to Check If Your Preset Allows Image Uploads

### Step 1: Go to Cloudinary Dashboard
1. Open https://cloudinary.com/console
2. Go to **Settings** (gear icon)
3. Click **Upload** tab

### Step 2: Find Your Preset
Look for the preset matching `CLOUDINARY_UPLOAD_PRESET` value.

Click on it to open the **Preset Details** page.

---

## ✅ Settings to Check

### 1. **Allowed File Types / Resource Types**
**Location:** Usually near the top of preset settings

Look for any of these:
- "Resource types" dropdown
- "File types" or "Format" restrictions
- "Allowed formats" list

**What to check:**
```
☑ Image  ← MUST BE CHECKED
☐ Video
☐ Raw (documents)
```

**If images are not allowed:** Click the checkbox to enable images.

---

### 2. **File Type Restrictions (Format Whitelist)**
**Location:** Often called "Allowed formats" or "Format restrictions"

Look for a list like:
```
jpg, jpeg, png, gif, webp, bmp, tiff, ico, pdf, svg
```

**What to check:**
- Is it empty? (Empty = all formats allowed) ✅
- Does it include at least one image format like `jpg` or `png`? ✅
- If empty, you're good.
- If it has formats listed, make sure it includes jpg, jpeg, or png.

**Note:** The function sends JPEG base64 data, so jpeg must be in the list.

---

### 3. **File Size Limits**
**Location:** "Max file size" or "File size" field

**What to check:**
```
Max file size: _______ MB  (or unlimited)
```

**Is it reasonable?** 
- For a canvas editor, 50+ MB should be fine
- The test image is only 37 KB so this isn't the issue

---

### 4. **Folder / Path Settings**
**Location:** "Folder" or "Save as" field

**What's set:**
```
Folder: dzine-orders    (or whatever you configured)
```

**What to check:**
- Should work fine for uploads
- Not the cause of 500 error

---

### 5. **Tags & Metadata**
**Location:** Sometimes there's an "Auto-tag" or "Tags" field

**What to check:**
- Usually doesn't affect uploads
- Can be ignored for this issue

---

### 6. **Invalidate CDN Cache**
**Location:** Toggle option in preset

**What to check:**
- Can be on or off, not the issue

---

### 7. **Unsigned Request Settings** ⭐ IMPORTANT
**Location:** Usually at the top or bottom

**What to check:**
```
Allow unsigned requests: ☑ ON  ← CRITICAL
```

If this is OFF, the function can't upload. Toggle it ON.

---

### 8. **Accessibility & Permissions**
**Location:** Sometimes there's an "Access level" or similar

**What to check:**
```
Access level: Public  ← Should allow uploads
```

If it's set to "Private" or "Restricted", that could block it.

---

## 🔴 Most Likely Culprits

If you've confirmed the preset is:
- ✅ Unsigned
- ✅ Exists with correct name

Then the issue is probably **ONE OF THESE:**

### 1. Resource Type Not Set to "Image"
**Symptom:** Function can't identify it as an image upload  
**Fix:** Ensure "Image" resource type is enabled in preset

### 2. Format Whitelist Excludes JPEG
**Symptom:** Function sends JPEG but preset doesn't allow it  
**Fix:** Add `jpeg` or `jpg` to allowed formats, or clear the list

### 3. Some Restriction Rule Blocking the Upload
**Symptom:** Random 500 errors from Cloudinary  
**Fix:** Look for any rules/restrictions and temporarily disable them

---

## 🧪 Test After Checking

Once you've verified all settings:

```bash
cd /home/peter/.openclaw/workspace/peecho-dzine-app

# Run the test again
node test-env-vars.js

# You should see:
# Error: "Cloudinary upload failed: 500"  ← (if still failing)
# OR
# Success! Image uploaded to Cloudinary  ← (if fixed)
```

---

## 💡 Quick Screenshot Guide

When you open the preset, you should see something like:

```
┌─ Upload Preset Settings ──────────────────┐
│                                            │
│ Preset name: dzine_uploads                │
│ Unsigned: ☑ ON                             │
│                                            │
│ Resource type: ☑ Image  ☐ Video  ☐ Raw   │
│                                            │
│ Allowed formats: [leave empty or add jpeg]│
│                                            │
│ Max file size: [50 MB or more]            │
│                                            │
│ Folder: dzine-orders                      │
│                                            │
│ [Save Changes]                             │
└────────────────────────────────────────────┘
```

---

## 🆘 If Still Not Working

After checking all these settings, if it's still returning 500:

1. **Temporarily create a brand new preset:**
   - Name: `test-dzine-upload`
   - Unsigned: ON
   - Resource type: Image only
   - Allowed formats: EMPTY (allow all)
   - No other restrictions

2. **Update Netlify:**
   ```bash
   netlify link
   netlify env:set CLOUDINARY_UPLOAD_PRESET "test-dzine-upload"
   netlify deploy --prod
   ```

3. **Test again:**
   ```bash
   node test-env-vars.js
   ```

If the **fresh preset works**, something in the old preset was blocking it.  
If the **fresh preset also fails**, it's a Cloudinary account issue.

---

**Quick Reference:** The most common reason for 500 errors is **Resource type not set to Image** or **Format list excluding jpeg**.

Check those two first! 🎯
