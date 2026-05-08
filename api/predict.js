import axios from 'axios';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const { image } = req.body;
  const BUILD_ID = "3.0.4"; // Used to verify deployment

  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY_MISSING', build: BUILD_ID });

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // The Probe List: We will try these combinations in order
    const probes = [
      { ver: 'v1', model: 'gemini-1.5-flash' },
      { ver: 'v1beta', model: 'gemini-1.5-flash' },
      { ver: 'v1', model: 'gemini-1.5-pro' },
      { ver: 'v1beta', model: 'gemini-pro-vision' }
    ];

    let lastError = null;

    for (const probe of probes) {
      try {
        const API_URL = `https://generativelanguage.googleapis.com/${probe.ver}/models/${probe.model}:generateContent?key=${apiKey}`;
        
        const payload = {
          contents: [{
            parts: [
              { text: "Analyze this plant leaf. Return ONLY a JSON object: { 'name': 'Disease Name', 'confidence': '95%', 'advice': 'Short cure advice', 'severity': 'high/medium/low/none' }" },
              { inline_data: { mime_type: "image/jpeg", data: base64Data } }
            ]
          }]
        };

        const response = await axios.post(API_URL, payload, { timeout: 12000 });
        
        let resultText = response.data.candidates[0].content.parts[0].text;
        resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
        
        const result = JSON.parse(resultText);
        return res.status(200).json({ ...result, _debug: probe, build: BUILD_ID });

      } catch (err) {
        lastError = err;
        console.warn(`Probe failed: ${probe.ver}/${probe.model}`);
        continue;
      }
    }

    throw lastError;

  } catch (error) {
    const apiMsg = error.response?.data?.error?.message || error.message;
    return res.status(500).json({ 
      error: 'Neural Hub Probing Failed', 
      details: apiMsg,
      build: BUILD_ID
    });
  }
}
