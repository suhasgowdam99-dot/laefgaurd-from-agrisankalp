import axios from 'axios';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = process.env.GEMINI_API_KEY;
  const { image } = req.body;

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'API_KEY_NOT_CONFIGURED', 
      advice: 'Add GEMINI_API_KEY to Vercel Environment Variables.' 
    });
  }

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [
          { text: "Act as a precision plant pathologist. Analyze this leaf. Identify the specific disease. Provide a step-by-step cure. Return ONLY JSON: { 'name': '...', 'confidence': '...%', 'advice': '...', 'severity': 'high/medium/low' }" },
          { inline_data: { mime_type: "image/jpeg", data: base64Data } }
        ]
      }],
      generationConfig: { response_mime_type: "application/json" }
    };

    const response = await axios.post(API_URL, payload, { timeout: 25000 });
    const result = JSON.parse(response.data.candidates[0].content.parts[0].text);

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'AI_HUB_ERROR', details: error.message });
  }
}
