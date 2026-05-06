export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // Force JSON headers immediately
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const token = process.env.VITE_HF_TOKEN || process.env.HF_TOKEN;
  const { image } = req.body;

  if (!token) return res.status(500).json({ error: 'TOKEN_MISSING' });
  if (!image) return res.status(400).json({ error: 'IMAGE_MISSING' });

  try {
    // 1. Clean the base64 data
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const buffer = Buffer.from(base64Data, 'base64');

    // 2. Use a high-availability classification model
    // This model is much faster and rarely 503s
    const API_URL = "https://api-inference.huggingface.co/models/microsoft/resnet-50";
    
    const response = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
      method: "POST",
      body: buffer,
    });

    // 3. Robust response parsing
    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid JSON from AI Hub', raw: text.substring(0, 50) });
    }

    if (response.status === 503) return res.status(503).json(result);
    if (!response.ok) return res.status(response.status).json({ error: result.error || 'AI Hub Busy' });

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({ error: 'Bridge Failed: ' + error.message });
  }
}
