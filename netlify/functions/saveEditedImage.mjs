import { getStore } from "@netlify/blobs";

/**
 * Netlify function to save an edited image using Netlify Blobs
 * Accepts a base64 data URL (canvas.toDataURL()) and stores it persistently.
 */
export async function handler(event, context) {
  console.log("Save Edited Image function called");

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed. Please use POST." })
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Request body is missing. Please send JSON data." })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON format" })
    };
  }

  const { imageData, productType = "canvas" } = body;

  if (!imageData) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing imageData in request body" })
    };
  }

  console.log("Received image data for product type:", productType);

  try {
    // Strip the data URL prefix (e.g. "data:image/png;base64,")
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Unique filename
    const filename = `edited-${Date.now()}-${Math.random().toString(36).slice(2)}.png`;

    // Get the Netlify Blobs store (no env vars needed — Netlify provides credentials automatically)
    const store = getStore("edited-images");

    // Store the image buffer with metadata
    await store.set(filename, imageBuffer, {
      metadata: {
        timestamp: new Date().toISOString(),
        productType
      }
    });

    // Build the public URL for the stored blob
    const imageUrl = store.getPublicUrl(filename);

    console.log("Image saved to Netlify Blobs:", filename, "→", imageUrl);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        imageUrl
      })
    };
  } catch (error) {
    console.error("Error saving image to Netlify Blobs:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}
