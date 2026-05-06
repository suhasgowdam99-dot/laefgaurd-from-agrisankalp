import axios from 'axios';

export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' },
  },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const token = process.env.HF_TOKEN || process.env.VITE_HF_TOKEN;
  const { image } = req.body;

  if (!token) return res.status(500).json({ error: 'AI Token Missing in Vercel settings.' });
  if (!image) return res.status(400).json({ error: 'No image data received.' });

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const buffer = Buffer.from(base64Data, 'base64');

    // Model 1: Specific Plant Disease Detection (Vencerlanz)
    const PRIMARY_URL = "https://api-inference.huggingface.co/models/vencerlanz09/plant-disease-detection";
    
    try {
      const response = await axios.post(PRIMARY_URL, buffer, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/octet-stream'
        },
        timeout: 20000
      });
      return res.status(200).json(response.data);
    } catch (err) {
      // If model 1 is loading, tell the frontend to retry
      if (err.response?.status === 503) {
        return res.status(503).json(err.response.data);
      }
      
      // If model 1 fails for other reasons, try Model 2 (General Plant Classification)
      const SECONDARY_URL = "https://api-inference.huggingface.co/models/linkan/plant-disease-classification";
      const retryResponse = await axios.post(SECONDARY_URL, buffer, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/octet-stream'
        },
        timeout: 20000
      });
      return res.status(200).json(retryResponse.data);
    }

  } catch (error) {
    // If BOTH models fail, send the exact error from Hugging Face
    const status = error.response?.status || 500;
    const details = error.response?.data?.error || error.message;
    return res.status(status).json({ 
      error: 'AI Hub Error', 
      details: details.toString() 
    });
  }
}
