# Peecho API V3 Integration Guide

## Quick Start

The Peecho API V3 is now working! ✅

**Endpoint:** `POST https://www.peecho.com/rest/v3/publication/create`

**What it does:** Creates a product listing (Publication) that customers can order via Peecho Checkout.

---

## Official API Documentation

The complete Peecho API V3 documentation (APIB format) is available in [`peechoapiv3.apib`](./peechoapiv3.apib).

Key sections:
- Order creation (`POST /order`)
- Payment processing (`POST /order/payment`)
- Publication creation (`POST /publication/create`) ← **We're using this**
- Product listings and pricing (`GET /offering/list`)
- Quote calculation (`POST /quote`)

---

## Working Example: Create a Publication

### Python Script

Location: `peecho_create_publication.py`

```python
#!/usr/bin/env python3
"""
Peecho V3 API - Create Publication
Creates a product listing that customers can order via Peecho Checkout
"""

import urllib.request
import urllib.error
import json
from datetime import datetime

API_KEY = "your_peecho_merchant_api_key"
IMAGE_URL = "https://your-image-url.com/image.png"

ENDPOINT = "https://www.peecho.com/rest/v3/publication/create"

def create_publication(title, image_url, currency="EUR", locale="en"):
    """Create a publication via Peecho V3 API"""
    
    payload = {
        "apiKey": API_KEY,
        "currency": currency,
        "locale": locale,
        "enableSecureCheckout": True,  # Enable secure checkout link
        "order": {
            "reference": f"publication-{datetime.now().timestamp()}",
            "product": {
                "title": title,
                "source": {
                    "file": {
                        "src": image_url,
                        "pages": 1,
                        "dimensions": {
                            "width": 210,
                            "height": 297
                        }
                    }
                },
                "thumbnail": {
                    "src": image_url
                }
            }
        }
    }
    
    headers = {
        "Content-Type": "application/json",
    }
    
    data = json.dumps(payload).encode('utf-8')
    
    try:
        req = urllib.request.Request(ENDPOINT, data=data, headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=10) as response:
            body = response.read().decode('utf-8')
            json_body = json.loads(body)
            
            if 'secure_publication_id' in json_body:
                pub_id = json_body.get('secure_publication_id')
                token = json_body.get('token')
                checkout_url = f"https://www.peecho.com/checkout/print/en/{pub_id}?token={token}"
                return {
                    "success": True,
                    "publication_id": pub_id,
                    "token": token,
                    "checkout_url": checkout_url
                }
            else:
                return {"success": True, "publication_id": json_body}
    
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            error_data = json.loads(body)
            return {"success": False, "error": error_data.get('details')}
        except:
            return {"success": False, "error": str(e)}

if __name__ == "__main__":
    result = create_publication(
        title="My Custom Dzine",
        image_url="https://res.cloudinary.com/your-cloud/image/upload/xyz.png"
    )
    
    if result['success']:
        print(f"✅ Publication created!")
        print(f"Checkout URL: {result['checkout_url']}")
    else:
        print(f"❌ Error: {result['error']}")
```

---

## API Request Format

### Endpoint
```
POST https://www.peecho.com/rest/v3/publication/create
```

### Request Body (JSON)
```json
{
  "apiKey": "your_merchant_api_key",
  "currency": "EUR",
  "locale": "en",
  "enableSecureCheckout": true,
  "order": {
    "reference": "unique-ref-per-publication",
    "product": {
      "title": "My Custom Product",
      "source": {
        "file": {
          "src": "https://your-image-url.com/image.png",
          "pages": 1,
          "dimensions": {
            "width": 210,
            "height": 297
          }
        }
      },
      "thumbnail": {
        "src": "https://your-image-url.com/image.png"
      }
    }
  }
}
```

### Successful Response (HTTP 200)
```json
{
  "secure_publication_id": "60d10ba4-2d64-4bcf-b4bd-f2a99c8c284a",
  "token": "f45f8534-aec6-4a23-a777-319fdc08ab21"
}
```

Or (if `enableSecureCheckout` is false):
```json
2196763
```
(Just a numeric publication ID)

### Checkout URL
```
https://www.peecho.com/checkout/print/en/{secure_publication_id}?token={token}
```

---

## Key Parameters

| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| `apiKey` | string | ✅ | Your Peecho Merchant API Key (from Settings > API) |
| `currency` | string | ✅ | EUR, USD, etc. (see APIB for full list) |
| `locale` | string | ✅ | en, de, nl, fr, es, etc. |
| `enableSecureCheckout` | boolean | ❌ | If true, returns secure_publication_id + token for direct checkout links |
| `order.reference` | string | ✅ | Unique reference per publication (you can use timestamp) |
| `order.product.title` | string | ✅ | Display name for the product |
| `source.file.src` | string | ✅ | URL to the image file (must be publicly accessible) |
| `source.file.pages` | number | ✅ | Number of pages (1 for single image) |
| `source.file.dimensions` | object | ✅ | Width/height in mm (210x297 = A4) |
| `thumbnail.src` | string | ✅ | URL to thumbnail image |

---

## Error Handling

### Common Errors

**HTTP 500 - Merchant not found**
```json
{
  "details": "Merchant by merchantApiKey XXXX not found",
  "timestamp": "2026-04-05T10:35:54.530923"
}
```
**Solution:** Make sure your API key belongs to the **production** environment (not test). Test environment requires a separate test API key.

**HTTP 404 - Application not found**
```json
{
  "details": "Application not found!",
  "timestamp": "2025-05-23T16:46:48.273807"
}
```
**Solution:** Check that your API key is valid and your account is set up correctly in Peecho dashboard.

---

## Next Steps: Integration into Dzine App

### Current Flow
```
User uploads image
    ↓
Dzine AI styles it
    ↓
User edits on canvas
    ↓
Image saved to Cloudinary
    ↓
[NEXT STEP: Create Peecho Publication]
    ↓
Redirect to checkout
```

### Implementation Plan

**File:** `netlify/functions/createPeechoPublication.mjs`

```javascript
import fetch from 'node-fetch';

export async function handler(event) {
  const { title, imageUrl, currency = 'EUR', locale = 'en' } = JSON.parse(event.body);
  
  const payload = {
    apiKey: process.env.PEECHO_MERCHANT_KEY,
    currency,
    locale,
    enableSecureCheckout: true,
    order: {
      reference: `dzine-${Date.now()}`,
      product: {
        title: title || 'Custom Dzine Product',
        source: {
          file: {
            src: imageUrl,
            pages: 1,
            dimensions: { width: 210, height: 297 }
          }
        },
        thumbnail: { src: imageUrl }
      }
    }
  };
  
  try {
    const response = await fetch('https://www.peecho.com/rest/v3/publication/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (data.secure_publication_id) {
      const checkoutUrl = `https://www.peecho.com/checkout/print/en/${data.secure_publication_id}?token=${data.token}`;
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          checkoutUrl,
          publicationId: data.secure_publication_id
        })
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          publicationId: data,
          checkoutUrl: `https://www.peecho.com/print/${data}`
        })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: error.message 
      })
    };
  }
}
```

**In React Component (e.g., `ImageEditor.js`):**

```javascript
const redirectToCheckout = async (imageUrl) => {
  try {
    const response = await fetch('/.netlify/functions/createPeechoPublication', {
      method: 'POST',
      body: JSON.stringify({
        title: 'My Custom Dzine',
        imageUrl: imageUrl,
        currency: 'EUR',
        locale: 'en'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Redirect to Peecho checkout
      window.location.href = data.checkoutUrl;
    } else {
      console.error('Failed to create publication:', data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## References

- **Official Docs:** https://www.peecho.com/print-api-documentation
- **API Spec:** See `peechoapiv3.apib` in this repo
- **Dashboard:** https://www.peecho.com (Settings > API for your keys)
- **Test Environment:** https://test.www.peecho.com (requires separate test API key)

---

## MVP Implementation: Canvas-Only Product

**Status:** 🔜 Ready for Canvas offering_id integration

### Key Discovery: fixedOfferingId Parameter

The Publication API supports limiting the product type:

```javascript
{
  apiKey,
  currency,
  locale,
  enableSecureCheckout: true,
  fixedOfferingId: 180000,  // ← Canvas product ID (find yours in dashboard)
  order: { ... }
}
```

With `fixedOfferingId` set, the checkout shows only the specified Canvas product (no user selection needed).

### MVP Strategy: Single Canvas Product

**Why:**
- ✅ Cropping tool already built for 16x20 canvas (printable area corners pre-defined)
- ✅ No UI changes needed
- ✅ Can launch immediately
- ✅ Foundation for adding more products later

**To implement:**
1. Find Canvas offering_id in your Peecho dashboard (Settings > Products)
2. Set `fixedOfferingId: YOUR_CANVAS_ID` in `createPeechoPublication.mjs`
3. Test end-to-end
4. Deploy

### Finding Your Canvas Offering ID

**Method 1: Peecho Dashboard**
```
1. Log in: https://www.peecho.com
2. Settings > Products
3. Find "Canvas" product
4. Note the ID (e.g., 180123)
```

**Method 2: Offering List API**
```
GET https://www.peecho.com/rest/v3/offering/list
  ?merchantApiKey=YOUR_KEY
  &categoryFilter=WA          (Wall Art)
  &subCategoryFilter=CA       (Canvas)
```

Returns all Canvas offerings available for your account + region.

---

## Status

✅ **Peecho API V3 Publication Creation** - WORKING
- Endpoint confirmed
- Authentication working
- Returns functional checkout links
- Ready for Canvas integration

🔜 **Next:** 
1. Find Canvas offering_id
2. Add `fixedOfferingId` to createPeechoPublication.mjs
3. Test → Deploy
