import axios from 'axios';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // PULLS FROM VERCEL ENVIRONMENT
  const apiKey = process.env.GEMINI_API_KEY;
  const { image } = req.body;

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'GOOGLE_KEY_MISSING', 
      advice: 'Please add GEMINI_API_KEY to Vercel Environment Variables.' 
    });
  }

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // DIRECT GOOGLE CLOUD VISION ENDPOINT (STABLE v1)
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [
          { text: "Act as the Google Agricultural Intelligence engine. Analyze this leaf image. Identify the plant and any disease. Provide the exact name and a professional, step-by-step cure. Return ONLY a JSON object: { 'name': 'Exact Disease Name', 'confidence': '...%', 'advice': 'Full professional treatment instructions.', 'status': 'disease/healthy' }" },
          { inline_data: { mime_type: "image/jpeg", data: base64Data } }
        ]
      }]
    };

    const response = await axios.post(API_URL, payload, { timeout: 30000 });
    
    // Safety check for Google's Response
    if (!response.data.candidates || response.data.candidates.length === 0) {
      throw new Error("Google Knowledge Hub was unable to see this specific image clearly.");
    }

    const rawText = response.data.candidates[0].content.parts[0].text;
    const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanText);

    // SILENT IOT TRIGGER
    const TS_KEY = process.env.TS_WRITE_KEY;
    if (TS_KEY && result.status === 'disease') {
      axios.get(`https://api.thingspeak.com/update?api_key=${TS_KEY}&field3=1`).catch(() => {});
    }

    return res.status(200).json(result);

  } catch (error) {
    const googleMsg = error.response?.data?.error?.message || error.message;
    return res.status(500).json({ 
      error: 'Google Search Interrupted', 
      details: googleMsg,
      advice: 'Ensure "Generative Language API" is enabled in your Google Cloud Console for this key.'
    });
  }
}
