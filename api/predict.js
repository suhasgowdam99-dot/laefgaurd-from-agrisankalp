import axios from 'axios';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'Neural Hub Active',
      engine: 'SMART-ROUTER',
      build: '4.2.2',
      key_ready: !!process.env.GEMINI_API_KEY
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = process.env.GEMINI_API_KEY;
  const { image } = req.body;

  if (!apiKey) return res.status(500).json({ error: 'KEY_MISSING' });

  // List of model/version combinations to try in order of "power"
  const strategies = [
    { ver: 'v1beta', model: 'gemini-1.5-pro' },
    { ver: 'v1', model: 'gemini-1.5-pro' },
    { ver: 'v1', model: 'gemini-1.5-flash' },
    { ver: 'v1beta', model: 'gemini-1.5-flash' }
  ];

  const base64Data = image.includes(',') ? image.split(',')[1] : image;

  for (const strategy of strategies) {
    try {
      const API_URL = `https://generativelanguage.googleapis.com/${strategy.ver}/models/${strategy.model}:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [{
          parts: [
            { text: "Analyze this plant leaf for disease. Return ONLY JSON: { \"name\": \"Disease Name\", \"confidence\": \"95%\", \"advice\": \"Cure steps\", \"severity\": \"high/medium/low\" }" },
            { inline_data: { mime_type: "image/jpeg", data: base64Data } }
          ]
        }],
        generationConfig: { temperature: 0.1 }
      };

      const response = await axios.post(API_URL, payload, { timeout: 15000 });
      
      let resultText = response.data.candidates[0].content.parts[0].text;
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        // SUCCESS: Return the result and tell us which model worked
        return res.status(200).json({ ...result, _engine: strategy.model });
      }
    } catch (err) {
      const status = err.response?.status;
      // If it's a 404 (Model not found) or 400 (Invalid version), try next strategy
      if (status === 404 || status === 400) {
        console.warn(`Strategy ${strategy.model}/${strategy.ver} failed, trying next...`);
        continue;
      }
      // If it's a real error (Auth, Quota), stop and report it
      return res.status(status || 500).json({ 
        error: 'Neural Link Error', 
        details: err.response?.data?.error?.message || err.message 
      });
    }
  }

  return res.status(404).json({ error: 'No compatible model found for this API key.' });
}
