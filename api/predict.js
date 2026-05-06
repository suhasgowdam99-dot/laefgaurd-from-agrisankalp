import axios from 'axios';

export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' },
  },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // Use GEMINI_API_KEY from Vercel env
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const { image } = req.body;

  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY missing in Vercel settings.' });
  if (!image) return res.status(400).json({ error: 'No image data.' });

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // Google Gemini 1.5 Flash Endpoint
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        parts: [
          { text: "Analyze this plant leaf image. Identify the disease if any. Return ONLY a JSON object with this exact structure: { 'name': 'Disease Name or Healthy', 'confidence': 'Percentage%', 'advice': 'Short 2-sentence treatment advice', 'severity': 'low/medium/high/none' }" },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        response_mime_type: "application/json",
      }
    };

    const response = await axios.post(API_URL, payload, { timeout: 20000 });
    
    // Parse Gemini's structured response
    const geminiText = response.data.candidates[0].content.parts[0].text;
    const result = JSON.parse(geminiText);

    return res.status(200).json(result);

  } catch (error) {
    console.error('Gemini Bridge Error:', error.message);
    return res.status(500).json({ 
      error: 'Gemini Hub Error', 
      details: error.response?.data?.error?.message || error.message 
    });
  }
}
