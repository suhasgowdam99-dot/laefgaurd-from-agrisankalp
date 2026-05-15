import axios from 'axios';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  // 1. DIAGNOSTIC MODE (For when you visit the link in browser)
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'Google Cloud Bridge Active',
      engine: 'Gemini 1.5 Pro',
      key_detected: !!process.env.GEMINI_API_KEY,
      tip: process.env.GEMINI_API_KEY ? 'Your key is loaded. Use the website button to scan.' : 'ERROR: GEMINI_API_KEY is missing in Vercel settings.'
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  const { image } = req.body;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing API Key', advice: 'Please add GEMINI_API_KEY to Vercel and redeploy.' });
  }

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // Direct Google Cloud Vision Path (v1 Stable)
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [
          { text: "Analyze this plant leaf image. If it is diseased, name the specific disease and give cure steps. If healthy, say it is healthy. Return ONLY JSON: { 'name': '...', 'confidence': '...%', 'advice': '...', 'severity': 'high/medium/low/none' }" },
          { inline_data: { mime_type: "image/jpeg", data: base64Data } }
        ]
      }]
    };

    const response = await axios.post(API_URL, payload, { timeout: 30000 });
    
    const resultText = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return res.status(200).json(result);
    }
    
    throw new Error('Google returned unreadable data.');

  } catch (error) {
    const apiError = error.response?.data?.error?.message || error.message;
    // NO MORE FAKING: If it fails, we show the real error
    return res.status(500).json({ 
      error: 'Google AI Hub Error', 
      advice: `The AI could not process the image. Reason: ${apiError}`
    });
  }
}
