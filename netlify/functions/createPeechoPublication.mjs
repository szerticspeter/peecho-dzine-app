/**
 * createPeechoPublication.mjs
 * Netlify serverless function — Peecho V3 Publication API
 *
 * Flow:
 *   1. Receive { imageUrl, title?, currency?, locale? } from frontend
 *   2. POST https://www.peecho.com/rest/v3/publication/create with Canvas offering locked in
 *   3. Return { checkoutUrl } → frontend redirects user
 */

const PEECHO_ENDPOINT = 'https://www.peecho.com/rest/v3/publication/create';
const CANVAS_OFFERING_ID = 6968193;  // 41x51cm / 16x20" Stretched Canvas [Black Wrap]

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
  } = payload;

  if (!imageUrl) {
    return jsonResponse(400, { error: 'Missing required field: imageUrl' });
  }

  const apiKey = process.env.PEECHO_MERCHANT_KEY;
  if (!apiKey) {
    console.error('Missing PEECHO_MERCHANT_KEY env var');
    return jsonResponse(500, { error: 'Server configuration error.' });
  }

  const requestBody = {
    apiKey,
    currency,
    locale,
    enableSecureCheckout: true,
    fixedOfferingId: CANVAS_OFFERING_ID,  // Lock to 41x51cm / 16x20" Canvas
    order: {
      reference: `dzine-${Date.now()}`,
      product: {
        title,
        source: {
          file: {
            src: imageUrl,
            pages: 1,
            dimensions: {
              width: 41,    // cm (41x51cm canvas)
              height: 51,
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

    // enableSecureCheckout=true returns { secure_publication_id, token }
    if (data.secure_publication_id) {
      const checkoutUrl = `https://www.peecho.com/checkout/print/${locale}/${data.secure_publication_id}?token=${data.token}`;
      console.log('Publication created, checkout URL:', checkoutUrl);

      return jsonResponse(200, {
        success: true,
        checkoutUrl,
        publicationId: data.secure_publication_id,
      });
    }

    // Fallback: numeric publication ID (enableSecureCheckout=false or older response)
    if (data) {
      const publicationId = typeof data === 'number' ? data : data.publicationId || data.id;
      const checkoutUrl = `https://www.peecho.com/print/${publicationId}`;
      console.log('Publication created (numeric), checkout URL:', checkoutUrl);

      return jsonResponse(200, {
        success: true,
        checkoutUrl,
        publicationId,
      });
    }

    throw new Error('Peecho returned an unexpected response: ' + JSON.stringify(data));

  } catch (err) {
    console.error('createPeechoPublication error:', err.message);
    return jsonResponse(502, { error: err.message });
  }
}
