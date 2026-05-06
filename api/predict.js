import axios from 'axios';

export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' },
  },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  // 1. DEBUG MODE: Help the user see what variables exist
  if (req.method === 'GET') {
    const keys = Object.keys(process.env).filter(k => k.includes('TOKEN') || k.includes('HF') || k.includes('VITE'));
    return res.status(200).json({ 
      status: 'Online', 
      detected_env_keys: keys,
      tip: 'If LEAFGUARD_TOKEN or HF_TOKEN is not in the list above, Vercel cannot see your variable.'
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // 2. Try every possible name for the token
  const token = process.env.LEAFGUARD_TOKEN || process.env.HF_TOKEN || process.env.VITE_HF_TOKEN;
  
  if (!token) {
    return res.status(500).json({ 
      error: 'AI Token Missing', 
      details: 'The server checked for: LEAFGUARD_TOKEN, HF_TOKEN, and VITE_HF_TOKEN but found nothing.' 
    });
  }

  const { image } = req.body;
  if (!image) return res.status(400).json({ error: 'No image data.' });

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const buffer = Buffer.from(base64Data, 'base64');

    const PRIMARY_URL = "https://api-inference.huggingface.co/models/vencerlanz09/plant-disease-detection";
    
    const response = await axios.post(PRIMARY_URL, buffer, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream'
      },
      timeout: 20000
    });
    
    return res.status(200).json(response.data);

  } catch (error) {
    const status = error.response?.status || 500;
    const details = error.response?.data?.error || error.message;
    
    if (status === 503) return res.status(503).json(error.response.data);

    return res.status(status).json({ 
      error: 'AI Hub Error', 
      details: details.toString() 
    });
  }
}
