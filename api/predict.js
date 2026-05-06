export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.HF_TOKEN || process.env.VITE_HF_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'AI API Token (VITE_HF_TOKEN) is missing in Vercel settings.' });
  }

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image data.' });

    const base64Data = image.split(',')[1] || image;
    const buffer = Buffer.from(base64Data, 'base64');

    // NEW MODEL: linkan/plant-disease-classification
    const API_URL = "https://api-inference.huggingface.co/models/linkan/plant-disease-classification";
    
    const response = await fetch(API_URL, {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/octet-stream"
      },
      method: "POST",
      body: buffer,
    });

    const result = await response.json();

    // Handle Hugging Face "Model Loading" (503)
    if (response.status === 503) {
      return res.status(503).json(result);
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: result.error || 'AI Model Error' });
    }

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({ error: 'Bridge Error: ' + error.message });
  }
}
