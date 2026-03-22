import { getStore } from "@netlify/blobs";

/**
 * Netlify function to serve an edited image from Netlify Blobs.
 * GET /?filename=edited-...-xxx.png
 * Returns the binary image with appropriate headers.
 */
export async function handler(event, context) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed. Please use GET." })
    };
  }

  const filename = event.queryStringParameters?.filename;

  if (!filename) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing filename query parameter." })
    };
  }

  try {
    const store = getStore("edited-images");
    const arrayBuffer = await store.get(filename, { type: 'arrayBuffer' });

    if (!arrayBuffer) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Image not found." })
      };
    }

    // Convert ArrayBuffer to base64 for Netlify Functions response
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*'
      },
      body: base64,
      isBase64Encoded: true
    };
  } catch (error) {
    console.error("Error retrieving image from Netlify Blobs:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
