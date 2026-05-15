import axios from 'axios';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  // 1. DIAGNOSTIC PROBE (GET)
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'Pro Engine Online',
      engine: 'GEMINI-PRO-CORE',
      build: '4.2.0',
      key_ready: !!process.env.GEMINI_API_KEY
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  const { image } = req.body;

  if (!apiKey) return res.status(500).json({ error: 'CONFIG_ERROR', details: 'GEMINI_API_KEY is not set in Vercel settings.' });
  if (!image) return res.status(400).json({ error: 'DATA_ERROR', details: 'No image data received.' });

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // --- UPGRADED TO PRO ENGINE ---
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [
          { text: "You are a professional plant pathologist specializing in high-value and exotic crops. Analyze this leaf image with 100% precision. Identify the exact pathogen or deficiency. Return ONLY a valid JSON object: { 'name': 'Disease Name', 'confidence': '99%', 'advice': 'Professional cure steps.', 'severity': 'high/medium/low' }" },
          { inline_data: { mime_type: "image/jpeg", data: base64Data } }
        ]
      }],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.1 // Low temperature for high precision
      }
    };

    const response = await axios.post(API_URL, payload, { timeout: 25000 });
    
    let resultText = response.data.candidates[0].content.parts[0].text;
    // Remove any markdown if the model ignores the JSON request
    resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const result = JSON.parse(resultText);

    // SILENT IOT TRIGGER
    const TS_KEY = process.env.TS_WRITE_KEY;
    if (TS_KEY && (result.severity === 'high' || result.severity === 'medium')) {
      axios.get(`https://api.thingspeak.com/update?api_key=${TS_KEY}&field3=1`).catch(() => {});
    }

    return res.status(200).json({ ...result, engine: 'Gemini Pro' });

  } catch (error) {
    console.error('Pro Engine Error:', error.message);
    const details = error.response?.data?.error?.message || error.message;
    return res.status(500).json({ 
      error: 'Neural Link Failure', 
      details: details,
      engine: 'Gemini Pro'
    });
  }
}
