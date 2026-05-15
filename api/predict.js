import axios from 'axios';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'Diagnostic Mode',
      key_present: !!process.env.GEMINI_API_KEY,
      node: process.version
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const { image } = req.body;

  if (!apiKey) return res.status(500).json({ error: 'API_KEY_MISSING' });

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // Use the absolute full path for the model
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [
          { text: "Analyze this plant leaf for disease. Return ONLY JSON: { 'name': 'Disease Name', 'confidence': '95%', 'advice': 'Cure steps', 'severity': 'high/low' }" },
          { inline_data: { mime_type: "image/jpeg", data: base64Data } }
        ]
      }]
    };

    const response = await axios.post(API_URL, payload, { timeout: 30000 });
    
    const resultText = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (error) {
    // PASS THROUGH THE EXACT ERROR FROM GOOGLE
    const googleError = error.response?.data?.error?.message || error.message;
    return res.status(500).json({ 
      error: 'Google API Rejection', 
      details: googleError,
      advice: `Google says: "${googleError}". Check if "Generative Language API" is ENABLED in your Google Cloud Console.`
    });
  }
}
