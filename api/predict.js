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
    return res.status(500).json({ error: 'GOOGLE_SEARCH_OFFLINE', advice: 'Add your Google API Key to Vercel.' });
  }

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // Use Google's Core Knowledge Engine
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [
          { text: "Search the Google Agriculture Database for this image. Identify the specific plant disease or if it is healthy. Provide a professional cure. Return ONLY a JSON object: { 'name': '...', 'confidence': '...', 'advice': '...', 'severity': 'high/low' }" }
          , { inline_data: { mime_type: "image/jpeg", data: base64Data } }
        ]
      }]
    };

    const response = await axios.post(API_URL, payload, { timeout: 20000 });
    const resultText = response.data.candidates[0].content.parts[0].text;
    const finalResult = JSON.parse(resultText.replace(/```json/g, "").replace(/```/g, "").trim());

    return res.status(200).json({ ...finalResult, source: 'Google Search Engine' });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Google Link Interrupted', 
      details: error.response?.data?.error?.message || error.message 
    });
  }
}
