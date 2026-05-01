export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.VITE_HF_TOKEN;
  
  if (!token) {
    return res.status(500).json({ error: 'AI Token (VITE_HF_TOKEN) is not configured in Vercel Environment Variables.' });
  }

  try {
    const { image } = req.body; // Expecting base64 string
    
    // Convert base64 to Buffer for Hugging Face
    const base64Data = image.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    const API_URL = "https://api-inference.huggingface.co/models/vencerlanz09/plant-disease-detection";
    
    const response = await fetch(API_URL, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream"
      },
      method: "POST",
      body: buffer,
    });

    const result = await response.json();

    // Handle Hugging Face "Model Loading" status
    if (response.status === 503 || (result.error && result.error.includes("loading"))) {
      return res.status(503).json(result);
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: result.error || 'AI Model Error' });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
}
