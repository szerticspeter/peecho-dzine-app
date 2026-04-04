/**
 * Netlify function to save an edited image using Cloudinary
 * Accepts a base64 data URL (canvas.toDataURL()) and uploads it to Cloudinary.
 * Returns { success: true, imageUrl } — the Cloudinary secure_url.
 */
export async function handler(event) {
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

  const { imageData } = body;

  if (!imageData) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing imageData in request body" })
    };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Cloudinary configuration missing (CLOUDINARY_CLOUD_NAME or CLOUDINARY_UPLOAD_PRESET not set)" })
    };
  }

  console.log("Uploading image to Cloudinary...");

  try {
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    // Use FormData for proper multipart/form-data encoding (required by Cloudinary for file uploads)
    const formData = new FormData();
    formData.append('file', imageData);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'dzine-orders');

    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData
      // Note: Do NOT set Content-Type header when using FormData
      // The browser will automatically set it with the correct boundary
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary upload failed:", response.status, errorText);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: `Cloudinary upload failed: ${response.status}` })
      };
    }

    const result = await response.json();
    const imageUrl = result.secure_url;

    console.log("Image uploaded to Cloudinary:", imageUrl);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        imageUrl
      })
    };
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}
