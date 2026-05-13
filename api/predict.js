export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const { image } = req.body;

  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY_MISSING' });

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // Use the absolute stable v1beta endpoint
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [
          { text: "You are a world-class plant pathologist. Analyze this leaf image with high precision. Identify the exact disease, including for expensive and rare crops. Return ONLY a JSON object: { 'name': 'Exact Disease Name', 'confidence': '98.5%', 'advice': 'Step-by-step professional cure instructions.', 'severity': 'high/medium/low/none' }" },
          { inline_data: { mime_type: "image/jpeg", data: base64Data } }
        ]
      }],
      generationConfig: { response_mime_type: "application/json" }
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Google AI Hub busy');
    }

    const resultText = data.candidates[0].content.parts[0].text;
    const finalResult = JSON.parse(resultText);

    // --- SILENT IOT TRIGGER (BACKEND ONLY) ---
    // If disease detected, trigger sprayer silently
    const TS_KEY = process.env.TS_WRITE_KEY;
    if (TS_KEY && finalResult.severity === 'high') {
      fetch(`https://api.thingspeak.com/update?api_key=${TS_KEY}&field3=1`).catch(() => {});
    }

    return res.status(200).json({ ...finalResult, source: 'Neural Hub High-Precision' });

  } catch (error) {
    return res.status(500).json({ error: 'Neural Signal Interrupted', details: error.message });
  }
}
