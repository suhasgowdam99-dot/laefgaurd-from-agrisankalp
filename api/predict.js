export default async function handler(req, res) {
  // 1. Health check for GET requests
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'Backend Bridge is Online' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.HF_TOKEN || process.env.VITE_HF_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'AI Token is missing. Please add VITE_HF_TOKEN to Vercel Environment Variables.' });
  }

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image data received.' });

    // Extract raw base64 data
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const buffer = Buffer.from(base64Data, 'base64');

    const API_URL = "https://api-inference.huggingface.co/models/linkan/plant-disease-classification";
    
    const response = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
      method: "POST",
      body: buffer,
    });

    const result = await response.json();

    if (response.status === 503) {
      return res.status(503).json(result); // Model loading
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: result.error || 'Hugging Face API Error' });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Bridge Error:', error);
    return res.status(500).json({ error: 'Bridge Internal Error: ' + error.message });
  }
}
