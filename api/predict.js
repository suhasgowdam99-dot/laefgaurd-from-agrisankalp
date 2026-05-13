import axios from 'axios';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  // 1. Set Security Headers
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // 2. CRITICAL: Key is ONLY pulled from Vercel's private environment
  // It is NEVER exposed to the frontend browser
  const apiKey = process.env.GEMINI_API_KEY;
  const { image } = req.body;

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'AI_HUB_AUTH_REQUIRED', 
      details: 'Vercel secret key is not set. Please add GEMINI_API_KEY in Vercel settings.' 
    });
  }

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // Google Gemini 1.5 Flash - High Precision Path
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [
          { text: "Identify the plant disease in this image. Focus on precision. Return ONLY a JSON object: { 'name': 'Disease Name', 'confidence': '95%', 'advice': 'Short professional cure advice', 'severity': 'high/medium/low/none' }" },
          { inline_data: { mime_type: "image/jpeg", data: base64Data } }
        ]
      }],
      generationConfig: { response_mime_type: "application/json" }
    };

    const response = await axios.post(API_URL, payload, { timeout: 20000 });
    
    const resultText = response.data.candidates[0].content.parts[0].text;
    const finalResult = JSON.parse(resultText);

    // If disease is high-severity, trigger sprayer silently
    const TS_KEY = process.env.TS_WRITE_KEY;
    if (TS_KEY && finalResult.severity === 'high') {
      axios.get(`https://api.thingspeak.com/update?api_key=${TS_KEY}&field3=1`).catch(() => {});
    }

    return res.status(200).json({ ...finalResult, source: 'Neural Hub High-Precision' });

  } catch (error) {
    console.error('Secure Bridge Error:', error.message);
    const apiError = error.response?.data?.error?.message || error.message;
    
    // Provide a detailed error message in the advice box if it fails
    return res.status(500).json({ 
      error: 'AI Connection Failed', 
      details: apiError 
    });
  }
}
