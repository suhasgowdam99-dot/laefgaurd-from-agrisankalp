import axios from 'axios';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = process.env.GEMINI_API_KEY;
  const { image } = req.body;

  if (!apiKey) return res.status(500).json({ error: 'GOOGLE_LINK_OFFLINE' });

  try {
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // Use v1 and gemini-1.5-flash (most stable for vision)
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [
          { text: "Identify the plant and any disease in this image. Return ONLY a JSON object: { 'name': 'Plant Name', 'status': 'disease/healthy', 'advice': 'Precise cure or care instructions', 'confidence': '95%' }" },
          { inline_data: { mime_type: "image/jpeg", data: base64Data } }
        ]
      }]
    };

    const response = await axios.post(API_URL, payload, { timeout: 15000 });
    
    if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
        throw new Error("Gemini returned no results. Check if the image is clear.");
    }

    let rawText = response.data.candidates[0].content.parts[0].text;
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const finalResult = JSON.parse(rawText);

    return res.status(200).json(finalResult);

  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    
    const errorDetails = error.response?.data?.error?.message || error.message;

    return res.status(200).json({
      name: "Intelligence Hub Error",
      status: "healthy",
      advice: `Technical Details: ${errorDetails}. Please ensure 'Generative Language API' is enabled in Google Cloud.`,
      confidence: "0%"
    });
  }
}
