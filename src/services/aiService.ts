import { GoogleGenerativeAI } from "@google/generative-ai";

export interface DetectionResult {
  name: string;
  confidence: string;
  advice: string;
  severity: 'low' | 'medium' | 'high' | 'none';
  status?: 'loading' | 'success' | 'error';
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export const analyzeLeaf = async (base64Image: string, onProgress?: (msg: string) => void): Promise<DetectionResult> => {
  if (!API_KEY) {
    return {
      name: "API Key Missing",
      confidence: "0%",
      advice: "Please add VITE_GEMINI_API_KEY to your .env file or environment variables.",
      severity: "high",
      status: 'error'
    };
  }

  try {
    if (onProgress) onProgress("Initializing Gemini Neural Engine...");
    
    // Convert base64 to parts for Gemini
    const base64Data = base64Image.split(',')[1];
    const mimeType = base64Image.split(',')[0].split(':')[1].split(';')[0];

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze this leaf image for plant diseases. 
      Identify the plant species and detect any diseases.
      
      Return the result strictly as a JSON object with the following structure:
      {
        "name": "Disease Name or Healthy Plant Name",
        "confidence": "95%",
        "severity": "low | medium | high | none",
        "advice": "Clear, concise advice for treatment or maintenance"
      }
      
      If the leaf is healthy, set severity to "none".
    `;

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
    ];

    if (onProgress) onProgress("Running Neural Analysis...");
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response (sometimes Gemini wraps it in markdown blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...parsed,
        status: 'success'
      };
    }

    throw new Error("Could not parse AI response.");

  } catch (err: any) {
    console.error("Gemini Error:", err);
    return {
      name: "Analysis Failed",
      confidence: "0%",
      advice: `Error: ${err.message}. Ensure your API key is valid and you have internet connection.`,
      severity: "high",
      status: 'error'
    };
  }
};
