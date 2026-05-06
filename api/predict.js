export default async function handler(req, res) {
  // Always return JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Check for token in multiple possible env names
    const token = process.env.HF_TOKEN || process.env.VITE_HF_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'AI API Token is not configured in Vercel settings.' });
    }

    // 2. Validate input body
    const { image } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'No valid image data provided.' });
    }

    // 3. Robust Base64 extraction
    const parts = image.split(',');
    const base64Data = parts.length > 1 ? parts[1] : parts[0];
    
    let buffer;
    try {
      buffer = Buffer.from(base64Data, 'base64');
    } catch (e) {
      return res.status(400).json({ error: 'Image encoding is invalid.' });
    }

    // 4. Call Hugging Face
    const API_URL = "https://api-inference.huggingface.co/models/vencerlanz09/plant-disease-detection";
    
    const response = await fetch(API_URL, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream"
      },
      method: "POST",
      body: buffer,
    });

    // 5. Handle model loading state (503)
    if (response.status === 503) {
      const loadingData = await response.json();
      return res.status(503).json(loadingData);
    }

    // 6. Handle other API errors
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText };
      }
      return res.status(response.status).json({ error: errorData.error || 'AI Model Error' });
    }

    // 7. Success
    const result = await response.json();
    return res.status(200).json(result);

  } catch (error) {
    console.error('Proxy Exception:', error);
    return res.status(500).json({ error: 'Neural Hub Exception: ' + error.message });
  }
}
