/**
 * createPeechoOrder.mjs
 * Netlify serverless function — Peecho Checkout Uplift integration
 *
 * Flow:
 *   1. POST /checkout/uplift/order/create  → get orderId
 *   2. PUT  /checkout/uplift/order/update  → attach address + image URL
 *   3. Return checkoutUrl + orderKey to the client
 */

const PEECHO_BASE = 'https://www.peecho.com/checkout/uplift';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─── helpers ────────────────────────────────────────────────────────────────

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

async function peechoFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON body
  }

  if (!res.ok) {
    const msg = (data && (data.details || JSON.stringify(data))) || `HTTP ${res.status}`;
    throw new Error(`Peecho API error (${res.status}): ${msg}`);
  }

  return data;
}

// ─── handler ────────────────────────────────────────────────────────────────

export async function handler(event) {
  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed. Use POST.' });
  }

  if (!event.body) {
    return jsonResponse(400, { error: 'Request body is missing.' });
  }

  // Parse body
  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON.' });
  }

  const {
    imageUrl,
    firstName,
    lastName,
    email,
    address,   // street / address line 1
    city,
    postCode,
    country,   // ISO 2-letter, e.g. "HU"
    currency = 'EUR',
  } = payload;

  // Validate required fields
  const missing = [];
  if (!imageUrl)   missing.push('imageUrl');
  if (!firstName)  missing.push('firstName');
  if (!lastName)   missing.push('lastName');
  if (!email)      missing.push('email');
  if (!address)    missing.push('address');
  if (!city)       missing.push('city');
  if (!postCode)   missing.push('postCode');
  if (!country)    missing.push('country');

  if (missing.length) {
    return jsonResponse(400, { error: `Missing required fields: ${missing.join(', ')}` });
  }

  // Credentials from environment
  const merchantKey   = process.env.PEECHO_MERCHANT_KEY;
  const publicationId = process.env.PEECHO_PUBLICATION_ID;

  if (!merchantKey || !publicationId) {
    console.error('Missing PEECHO_MERCHANT_KEY or PEECHO_PUBLICATION_ID env vars');
    return jsonResponse(500, { error: 'Server configuration error.' });
  }

  try {
    // ── Step 1: Create order ──────────────────────────────────────────────
    console.log('Creating Peecho order for publication', publicationId);
    const createBody = {
      publicationId,
      geolocation: { countryCode: country },
      quantity: 1,
      currency,
    };

    const orderData = await peechoFetch(`${PEECHO_BASE}/order/create`, {
      method: 'POST',
      body: JSON.stringify(createBody),
    });

    const orderId = orderData.orderId;
    if (!orderId) {
      throw new Error('Peecho did not return an orderId. Response: ' + JSON.stringify(orderData));
    }
    console.log('Order created:', orderId);

    // ── Step 2: Update order with address + image ─────────────────────────
    const updateBody = {
      orderId,
      currency,
      imageUrl,                   // custom field — pass through so merchant can log it
      shippingAddress: {
        firstName,
        lastName,
        addressLine1: address,
        zipCode: postCode,
        city,
        countryCode: country,
        state: '',
        companyName: '',
        addressLine2: '',
        phoneNumber: '',
        email,
      },
      address: {
        shippingAddress: {
          firstName,
          lastName,
          addressLine1: address,
          zipCode: postCode,
          city,
          countryCode: country,
          state: '',
          companyName: '',
          addressLine2: '',
          phoneNumber: '',
          email,
        },
        hasBilling: false,
      },
    };

    await peechoFetch(`${PEECHO_BASE}/order/update`, {
      method: 'PUT',
      body: JSON.stringify(updateBody),
    });
    console.log('Order updated with address');

    // ── Step 3: Build checkout URL ────────────────────────────────────────
    const checkoutUrl =
      `https://www.peecho.com/configurator/checkout` +
      `?publicationId=${encodeURIComponent(publicationId)}` +
      `&orderId=${encodeURIComponent(orderId)}` +
      `&currency=${encodeURIComponent(currency)}`;

    return jsonResponse(200, {
      success: true,
      checkoutUrl,
      orderKey: orderId,
    });

  } catch (err) {
    console.error('createPeechoOrder error:', err.message);
    return jsonResponse(502, { error: err.message });
  }
}
