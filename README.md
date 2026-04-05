# Peecho Dzine App

> **Peecho V3 API Integration - Ready for Implementation** ✅

A print-on-demand app powered by Dzine.ai image styling, with Peecho as the fulfillment backend.

## What This Is

Users can:
1. Upload an image
2. Apply AI artistic styles via Dzine.ai
3. Position and customize the styled image on a product canvas
4. ✅ **Create custom Peecho products & checkout** (API working, integration pending)

## Current State

- ✅ Image upload & Dzine.ai style transformation
- ✅ Interactive image editor (position, scale, crop)
- ✅ Cropped image saved via serverless function
- ✅ **Peecho API V3 Publication Creation** (endpoint confirmed, returns functional checkout links)
- 🔜 Integration into app workflow (Netlify function + React component)

## Setup

```bash
npm install
npm run build
netlify deploy --prod
```

### Environment Variables (Netlify)

| Variable | Description |
|----------|-------------|
| `REACT_APP_DZINE_API_KEY` | Your Dzine.ai API key |
| `REACT_APP_PEECHO_API_KEY` | (Coming soon) Peecho API key |
| `REACT_APP_PEECHO_SHOP_ID` | (Coming soon) Peecho shop ID |

## Architecture

- **Frontend**: React SPA
- **Backend**: Netlify serverless functions
  - `proxyImage.mjs` - Proxy for Dzine.ai image generation
  - `saveEditedImage.mjs` - Save cropped image, returns URL
- **Fulfillment**: Peecho (integration pending)

## Peecho Integration 

**Status:** API Working ✅ | Integration Pending 🔜

See **[PEECHO_API.md](./PEECHO_API.md)** for:
- ✅ **Complete API documentation** (with working Python example)
- ✅ **Implementation guide** for Netlify functions + React
- ✅ **Official Peecho API V3 spec** (APIB format in `peechoapiv3.apib`)

### Quick Flow
```
User crops image → Create Peecho Publication (API) → Receive Checkout URL → Redirect
```

**Next Step:** Implement Netlify function `createPeechoPublication.mjs` (see PEECHO_API.md for code)

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| [`PEECHO_API.md`](./PEECHO_API.md) | Complete Peecho V3 API guide + integration plan |
| [`peechoapiv3.apib`](./peechoapiv3.apib) | Official Peecho API specification (APIB format) |
| [`scripts/peecho_create_publication.py`](./scripts/peecho_create_publication.py) | Working Python example (standalone test) |

---

## 🔍 RESOLVED - Peecho API Investigation (2026-04-04 → 2026-04-05)

**Status:** ✅ RESOLVED - API Working, Integration Pending

### What We Tested

1. ✅ **Cloudinary Integration** - WORKS
   - FormData instead of URLSearchParams (fixed in `saveEditedImage.mjs`)
   - Deploy: successful, live on Netlify
   
2. ✅ **Dzine.ai Integration** - WORKS
   - Style selection and transformation working
   - Styled image returns correctly

3. ⚠️ **Peecho Checkout API** - PARTIALLY WORKS
   - Current implementation uses Publication-based checkout (static product ID)
   - Requires pre-created product in Peecho dashboard (e.g., `2196394`)
   - **Problem:** App design requires **on-the-fly product creation** per user image

### The Core Issue

**App Vision:** Create custom products dynamically (one per unique user design)
```
User uploads → Dzine AI styles → Custom Canvas → NEW Peecho Product → Order
```

**Current Peecho Implementation:** Static product listings
```
User uploads → Dzine AI styles → FIXED Product ID → Order on existing product
```

### Peecho API Investigation Resolution

**Found:** Peecho V3 Publication Creation API (`POST /rest/v3/publication/create`)

**Key Discovery:**
- ✅ Correct endpoint: `https://www.peecho.com/rest/v3/publication/create` (not `api.peecho.com`)
- ✅ Supports dynamic product creation per-user image
- ✅ Returns secure checkout links
- ✅ Official API spec available (APIB format)

**What Works:**
- `PEECHO_MERCHANT_KEY`: 9453a60bbb4ff78d9543640832a5980a2f52f4bd ✅ (Prod environment)
- `PEECHO_BUTTON_KEY`: 177417121641766683 ✅
- Standalone test script: ✅ (returns functional checkout URL)
- Cloudinary integration: ✅

### Solution Implemented

**Option B Selected:** Dynamic product creation via API ✅

The Peecho V3 API supports exactly what the app needs:
1. User crops image → saved to Cloudinary
2. App calls Peecho API with image URL
3. Peecho creates Publication (dynamic product)
4. Returns checkout link
5. User completes purchase

**Details:** See [`PEECHO_API.md`](./PEECHO_API.md) for complete implementation guide

### Relevant Code Files

- `netlify/functions/createPeechoOrder.mjs` - Checkout order creation (Publication-based, needs refactor)
- `src/ImageEditor.js` - Canvas editor, calls `saveEditedImage` after crop
- `netlify/functions/saveEditedImage.mjs` - Image persistence (NOW USES FormData - WORKING)

### Environment Variables Set

```
PEECHO_MERCHANT_KEY=9453a60bbb4ff78d9543640832a5980a2f52f4bd
PEECHO_PUBLICATION_ID=2196394 (temporary test product - Canvas 16x20)
CLOUDINARY_CLOUD_NAME=dwrdcthuz
CLOUDINARY_UPLOAD_PRESET=peecho-dzine-app-upload-preset
```

### Bugs Fixed This Session

✅ Cloudinary upload: Fixed FormData encoding in `saveEditedImage.mjs`
✅ Deployed to production successfully
✅ Verified Cloudinary works end-to-end with real image

### Next Implementation Steps

**File to create:** `netlify/functions/createPeechoPublication.mjs`

```javascript
// See PEECHO_API.md for complete code example
// POST endpoint that:
// 1. Receives imageUrl from frontend
// 2. Calls Peecho API with user's image
// 3. Returns checkout URL
// 4. Frontend redirects user
```

**React integration:** Hook into `ImageEditor.js` after crop is saved

See [`PEECHO_API.md`](./PEECHO_API.md) for complete code & integration steps.
