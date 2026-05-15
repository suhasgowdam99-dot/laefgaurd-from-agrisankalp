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
    return res.status(500).json({ error: 'API_KEY_NOT_FOUND', advice: 'Add GEMINI_API_KEY to Vercel.' });
  }

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // --- FINAL STABLE v1 PRODUCTION ENDPOINT ---
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [
          { text: "Identify the plant disease in this image. Return ONLY a JSON object: { 'name': 'Disease Name', 'confidence': '95%', 'advice': 'Cure advice', 'severity': 'high/medium/low' }" },
          { inline_data: { mime_type: "image/jpeg", data: base64Data } }
        ]
      }]
    };

    const response = await axios.post(API_URL, payload, { timeout: 25000 });
    
    // Clean potential markdown from response
    let rawText = response.data.candidates[0].content.parts[0].text;
    const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanText);

    return res.status(200).json({ ...result, source: 'Google Stable v1' });

  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.error('Gemini v1 Error:', errorMsg);
    
    return res.status(500).json({ 
      error: 'Neural Link Failure', 
      details: errorMsg,
      advice: 'Ensure your Google AI Studio project has "Generative Language API" enabled.'
    });
  }
}
