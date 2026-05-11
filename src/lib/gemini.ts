import { GoogleGenerativeAI } from "@google/generative-ai";

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

export async function analyzeLeaf(imageBuffer: ArrayBuffer, mimeType: string) {
  if (!API_KEY) {
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this leaf image. 
    1. Identify the plant species if possible.
    2. Detect if there are any diseases or nutritional deficiencies.
    3. If a disease is found, provide:
       - Name of the disease.
       - Common symptoms visible.
       - Recommended organic and chemical treatments.
       - Preventive measures for the future.
    4. If the leaf is healthy, confirm it and give tips for maintenance.
    
    Please provide the response in a clear, structured Markdown format with headings.
  `;

  const imageParts = [
    {
      inlineData: {
        data: arrayBufferToBase64(imageBuffer),
        mimeType,
      },
    },
  ];

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  return response.text();
}
