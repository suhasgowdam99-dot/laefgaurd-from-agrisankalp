export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.VITE_HF_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'VITE_HF_TOKEN missing in environment.' });
  }

  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'No image data provided.' });
  }

  try {
    const base64Data = image.split(',')[1];
    if (!base64Data) throw new Error('Invalid image format.');
    const buffer = Buffer.from(base64Data, 'base64');

    const API_URL = "https://api-inference.huggingface.co/models/vencerlanz09/plant-disease-detection";
    
    // Use a controller to abort if it takes too long
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000); // 9 seconds limit

    const response = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
      method: "POST",
      body: buffer,
      signal: controller.signal
    });

    clearTimeout(timeout);

    const result = await response.json();

    if (response.status === 503) {
      return res.status(503).json(result);
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: result.error || 'AI Model Error' });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('API Error:', error.name);
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'AI request timed out. Please try again in 5 seconds.' });
    }
    return res.status(500).json({ error: 'Server Error: ' + error.message });
  }
}
