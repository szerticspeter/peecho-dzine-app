# Peecho Dzine App

> **Peecho version - checkout implementation coming**

A print-on-demand app powered by Dzine.ai image styling, with Peecho as the fulfillment backend.

## What This Is

Users can:
1. Upload an image
2. Apply AI artistic styles via Dzine.ai
3. Position and customize the styled image on a product canvas
4. (Coming soon) Complete checkout through Peecho

## Current State

- ✅ Image upload & Dzine.ai style transformation
- ✅ Interactive image editor (position, scale, crop)
- ✅ Cropped image saved via serverless function
- 🔜 Peecho API integration for checkout & fulfillment

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

## Peecho Integration Notes

After the user crops their image (`saveEditedImage` → returns `imageUrl`):
1. Create a Peecho order via their API
2. Pass the image URL and product SKU to Peecho
3. Redirect user to Peecho's hosted checkout

Relevant code: `src/ImageEditor.js` → `cropImage()` function → Step 2 placeholder comment
