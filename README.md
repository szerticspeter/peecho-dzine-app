# Peecho Dzine App

A print-on-demand app: users upload a photo, apply an AI artistic style, and order it on canvas via Peecho.

## How It Works

1. User uploads a photo
2. Selects an artistic style — Dzine.ai transforms the image (up to ~60 seconds)
3. User picks their favourite variation and clicks "Order Now"
4. App saves the image to Cloudinary, creates a Peecho V3 Publication, and redirects to Peecho checkout
5. At checkout, Peecho filters available products by shipping location and image dimensions
6. User selects size, enters address, and pays — Peecho handles printing and fulfillment

## Setup

```bash
npm install
npm run build
netlify deploy --prod
```

### Environment Variables (Netlify)

| Variable | Description |
|----------|-------------|
| `REACT_APP_DZINE_API_KEY` | Dzine.ai API key |
| `PEECHO_MERCHANT_KEY` | Peecho merchant key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset |

## Architecture

- **Frontend**: React SPA (`src/App.js`)
- **Backend**: Netlify serverless functions
  - `proxyImage.mjs` — CORS proxy for Dzine.ai image URLs
  - `saveEditedImage.mjs` — Uploads styled image to Cloudinary, returns URL
  - `createPeechoPublication.mjs` — Creates Peecho V3 publication, returns checkout URL

## API Reference

- [`peechoapiv3.apib`](./peechoapiv3.apib) — Official Peecho API V3 specification

## Archive

Deprecated components and development history: [`archive/README.md`](./archive/README.md)
