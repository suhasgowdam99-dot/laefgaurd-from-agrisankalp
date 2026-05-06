import axios from 'axios';

export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' },
  },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const { image } = req.body;

  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY missing in Vercel settings.' });
  if (!image) return res.status(400).json({ error: 'No image data.' });

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // STABLE ENDPOINT: Using v1 instead of v1beta
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        parts: [
          { text: "Identify the plant disease in this image. Return ONLY a JSON object: { 'name': 'Disease', 'confidence': '85%', 'advice': 'Cure instructions', 'severity': 'high/medium/low' }" },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Data
            }
          }
        ]
      }]
    };

    const response = await axios.post(API_URL, payload, { timeout: 25000 });
    
    // Improved Gemini extraction logic
    let resultText = response.data.candidates[0].content.parts[0].text;
    
    // Clean JSON if Gemini adds markdown blocks
    resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const result = JSON.parse(resultText);
    return res.status(200).json(result);

  } catch (error) {
    console.error('Gemini Bridge Error:', error.message);
    const apiError = error.response?.data?.error?.message || error.message;
    return res.status(500).json({ 
      error: 'Gemini Bridge Fail', 
      details: apiError
    });
  }
}
