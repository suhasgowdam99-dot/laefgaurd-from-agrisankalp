import axios from 'axios';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'Pro Engine Online',
      engine: 'GEMINI-PRO-COMPAT',
      build: '4.2.1',
      key_ready: !!process.env.GEMINI_API_KEY
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = process.env.GEMINI_API_KEY;
  const { image } = req.body;

  if (!apiKey) return res.status(500).json({ error: 'KEY_MISSING' });

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // Use Stable v1 for maximum reliability
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [
          { text: "Analyze this leaf image for plant disease. Return ONLY a JSON object. No other text. Structure: { \"name\": \"Disease Name\", \"confidence\": \"95%\", \"advice\": \"Exact cure steps\", \"severity\": \"high/medium/low\" }" },
          { inline_data: { mime_type: "image/jpeg", data: base64Data } }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        topP: 1,
        topK: 1
      }
    };

    const response = await axios.post(API_URL, payload, { timeout: 25000 });
    
    let resultText = response.data.candidates[0].content.parts[0].text;
    
    // THE FORCE-PARSE LOGIC:
    // Extract the JSON even if Gemini adds backticks or conversational text
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI did not return a valid data structure.");
    
    const finalResult = JSON.parse(jsonMatch[0]);

    // SILENT IOT BRIDGE
    const TS_KEY = process.env.TS_WRITE_KEY;
    if (TS_KEY && finalResult.severity === 'high') {
      axios.get(`https://api.thingspeak.com/update?api_key=${TS_KEY}&field3=1`).catch(() => {});
    }

    return res.status(200).json(finalResult);

  } catch (error) {
    const details = error.response?.data?.error?.message || error.message;
    return res.status(500).json({ 
      error: 'Neural Link Failure', 
      details: details 
    });
  }
}
