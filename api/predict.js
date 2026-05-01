export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.VITE_HF_TOKEN;
  const { image } = req.body;

  if (!token) return res.status(500).json({ error: 'VITE_HF_TOKEN not set in Vercel' });
  if (!image) return res.status(400).json({ error: 'No image data' });

  try {
    const buffer = Buffer.from(image.split(',')[1], 'base64');
    const API_URL = "https://api-inference.huggingface.co/models/vencerlanz09/plant-disease-detection";
    
    const response = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
      method: "POST",
      body: buffer,
    });

    const result = await response.json();

    if (response.status === 503) {
      return res.status(503).json(result);
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: result.error || 'AI Error' });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
