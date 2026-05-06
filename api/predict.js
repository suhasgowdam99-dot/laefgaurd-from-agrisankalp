import axios from 'axios';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const token = process.env.VITE_HF_TOKEN || process.env.HF_TOKEN;
  const { image } = req.body;

  if (!token) return res.status(500).json({ error: 'TOKEN_MISSING' });
  if (!image) return res.status(400).json({ error: 'IMAGE_MISSING' });

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const buffer = Buffer.from(base64Data, 'base64');

    // Model: google/vit-base-patch16-224 (Extremely stable)
    const API_URL = "https://api-inference.huggingface.co/models/google/vit-base-patch16-224";
    
    const response = await axios.post(API_URL, buffer, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream'
      },
      timeout: 25000 // Give it 25 seconds
    });

    return res.status(200).json(response.data);

  } catch (error) {
    const status = error.response?.status || 500;
    const errorData = error.response?.data || { error: error.message };
    
    // Handle model loading
    if (status === 503) return res.status(503).json(errorData);

    console.error('Final Bridge Error:', error.message);
    return res.status(status).json({ 
      error: 'AI Hub Response Error',
      details: typeof errorData === 'string' ? errorData.substring(0, 100) : JSON.stringify(errorData)
    });
  }
}
