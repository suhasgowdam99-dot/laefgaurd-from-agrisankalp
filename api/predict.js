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
    return res.status(500).json({ error: 'CRITICAL_AUTH_FAILURE', details: 'Google API Key not detected in Vercel settings.' });
  }

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // Use the High-Capacity Gemini 1.5 Pro for maximum accuracy
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [
          { text: "CRITICAL TASK: Analyze this plant image for diseases. Search the global Google knowledge base. Look for microscopic spots, wilting, or discoloration. If any disease is found, you MUST identify it accurately. If it is 100% healthy, say so. Return ONLY a JSON object: { 'status': 'disease/healthy', 'name': 'Scientific and Common Name', 'confidence': '...%', 'advice': 'Precise professional treatment steps.' }" },
          { inline_data: { mime_type: "image/jpeg", data: base64Data } }
        ]
      }],
      generationConfig: {
        temperature: 0, // Force absolute factual accuracy, no 'creative' guessing
        response_mime_type: "application/json"
      }
    };

    const response = await axios.post(API_URL, payload, { timeout: 30000 });
    const resultText = response.data.candidates[0].content.parts[0].text;
    
    // Direct return - no fallbacks, no fakes
    const finalResult = JSON.parse(resultText.replace(/```json/g, "").replace(/```/g, "").trim());

    // THING SPEAK SILENT TRIGGER
    if (finalResult.status === 'disease') {
      const TS_KEY = process.env.TS_WRITE_KEY;
      if (TS_KEY) {
        axios.get(`https://api.thingspeak.com/update?api_key=${TS_KEY}&field3=1`).catch(() => {});
      }
    }

    return res.status(200).json(finalResult);

  } catch (error) {
    // REAL ERROR REPORTING - NO FAKING
    const status = error.response?.status || 500;
    const details = error.response?.data?.error?.message || error.message;
    
    return res.status(status).json({ 
      error: 'GOOGLE_LINK_FAILED', 
      details: details,
      advice: 'The website could not get a real answer from Google. Please check your API key or internet connection.'
    });
  }
}
