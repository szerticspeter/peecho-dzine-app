/**
 * createPeechoPublication.mjs
 * Netlify serverless function — Peecho V3 Publication API
 *
 * Flow:
 *   1. Receive { imageUrl, title?, currency?, locale? } from frontend
 *   2. POST https://www.peecho.com/rest/v3/publication/create
 *   3. Return { checkoutUrl } → frontend redirects user
 *
 * Note: No fixedOfferingId — Peecho auto-filters available products
 * by user's shipping location and image dimensions.
 * Note: No enableSecureCheckout — simple numeric ID + /print/{id} URL is more reliable.
 */

const PEECHO_ENDPOINT = 'https://www.peecho.com/rest/v3/publication/create';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed. Use POST.' });
  }

  if (!event.body) {
    return jsonResponse(400, { error: 'Request body is missing.' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON.' });
  }

  const {
    imageUrl,
    title = 'My Custom Dzine',
    currency = 'EUR',
    locale = 'en',
    width,   // actual image width in px (optional)
    height,  // actual image height in px (optional)
  } = payload;

  if (!imageUrl) {
    return jsonResponse(400, { error: 'Missing required field: imageUrl' });
  }

  // Peecho expects a PDF source file, not a raw image.
  // Cloudinary converts on-the-fly when the extension is changed to .pdf.
  const pdfUrl = imageUrl.replace(/\.(jpe?g|png|webp|gif)(\?|$)/i, '.pdf$2');

  const apiKey = process.env.PEECHO_MERCHANT_KEY;
  if (!apiKey) {
    console.error('Missing PEECHO_MERCHANT_KEY env var');
    return jsonResponse(500, { error: 'Server configuration error.' });
  }

  const requestBody = {
    apiKey,
    currency,
    locale,
    order: {
      reference: `dzine-${Date.now()}`,
      product: {
        title,
        source: {
          file: {
            src: pdfUrl,
            pages: 1,
            dimensions: {
              width: width || 210,
              height: height || 210,  // default square if no dims provided
            },
          },
        },
        thumbnail: {
          src: imageUrl,
        },
      },
    },
  };

  try {
    console.log('Creating Peecho publication for image:', imageUrl);

    const response = await fetch(PEECHO_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      throw new Error(`Peecho returned non-JSON response (${response.status}): ${text.slice(0, 200)}`);
    }

    if (!response.ok) {
      const msg = (data && data.details) || JSON.stringify(data) || `HTTP ${response.status}`;
      throw new Error(`Peecho API error (${response.status}): ${msg}`);
    }

    // Response is a numeric publication ID (e.g. 2196792)
    const publicationId = typeof data === 'number' ? data : parseInt(data, 10);

    if (!publicationId || isNaN(publicationId)) {
      throw new Error('Peecho returned an unexpected response: ' + JSON.stringify(data));
    }

    const checkoutUrl = `https://www.peecho.com/print/${publicationId}`;
    console.log('Publication created:', publicationId, '→', checkoutUrl);

    return jsonResponse(200, {
      success: true,
      checkoutUrl,
      publicationId,
    });

  } catch (err) {
    console.error('createPeechoPublication error:', err.message);
    return jsonResponse(502, { error: err.message });
  }
}
