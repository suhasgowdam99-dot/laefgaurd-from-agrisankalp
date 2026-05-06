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

  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY_MISSING', version: "2.1" });

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // We will try Model 1 (Flash), and if it fails, try Model 2 (Pro)
    const models = ["gemini-1.5-flash", "gemini-1.5-pro"];
    let lastError = null;

    for (const modelName of models) {
      try {
        const API_URL = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
        
        const payload = {
          contents: [{
            parts: [
              { text: "Identify the plant disease in this image. Return ONLY a JSON object: { 'name': 'Disease Name', 'confidence': '95%', 'advice': 'Cure instructions', 'severity': 'high/medium/low' }" },
              { inline_data: { mime_type: "image/jpeg", data: base64Data } }
            ]
          }]
        };

        const response = await axios.post(API_URL, payload, { timeout: 15000 });
        
        let resultText = response.data.candidates[0].content.parts[0].text;
        resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
        
        const result = JSON.parse(resultText);
        // Add the model name used for transparency
        return res.status(200).json({ ...result, model: modelName, version: "2.1" });

      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed, trying next...`);
        continue; // Try the next model
      }
    }

    // If both fail
    throw lastError;

  } catch (error) {
    const apiMsg = error.response?.data?.error?.message || error.message;
    return res.status(500).json({ 
      error: 'Neural Hub Offline', 
      details: apiMsg,
      version: "2.1"
    });
  }
}
