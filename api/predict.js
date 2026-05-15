import axios from 'axios';

export const config = {
  api: { bodyParser: { sizeLimit: '8mb' } },
};

export default async function handler(req, res) {
  // 1. DEVOPS DIAGNOSTIC (GET REQUEST)
  // Visit yoursite.vercel.app/api/predict in your browser to see this
  if (req.method === 'GET') {
    const hasKey = !!process.env.GEMINI_API_KEY;
    return res.status(200).json({
      status: 'API Bridge Active',
      diagnostics: {
        node_version: process.version,
        gemini_key_detected: hasKey,
        env_keys_found: Object.keys(process.env).filter(k => k.includes('KEY') || k.includes('TOKEN')),
        region: process.env.VERCEL_REGION || 'local'
      },
      action: hasKey ? 'Ready to process images.' : 'ERROR: GEMINI_API_KEY is missing in Vercel settings.'
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // 2. PRODUCTION LOGIC
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ENV_VAR_MISSING', details: 'Vercel cannot see GEMINI_API_KEY' });

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'NO_IMAGE_DATA' });

    const base64Data = image.split(',')[1] || image;
    
    // Stable Endpoint
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        parts: [
          { text: "Analyze leaf disease. Return JSON: { 'name': 'Name', 'confidence': '95%', 'advice': 'Cure', 'severity': 'high/low' }" },
          { inline_data: { mime_type: "image/jpeg", data: base64Data } }
        ]
      }]
    };

    const response = await axios.post(API_URL, payload, { timeout: 15000 });
    
    let resultText = response.data.candidates[0].content.parts[0].text;
    resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return res.status(200).json(JSON.parse(resultText));

  } catch (error) {
    const status = error.response?.status || 500;
    const errorData = error.response?.data || error.message;
    
    return res.status(status).json({ 
      error: 'UPSTREAM_AI_ERROR', 
      details: typeof errorData === 'string' ? errorData : JSON.stringify(errorData) 
    });
  }
}
