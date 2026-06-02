import { pipeline } from '@xenova/transformers';
import { supabase } from '../lib/supabase';

export interface DetectionResult {
  name: string;
  confidence: string;
  advice: string;
  severity: 'low' | 'medium' | 'high' | 'none';
  status: 'healthy' | 'disease';
  description?: string;
  treatment?: string;
  image_url?: string;
}

let pipe: any = null;

export const runCustomInference = async (imageSrc: string, onMsg?: (m: string) => void): Promise<DetectionResult> => {
  try {
    if (onMsg) onMsg("Querying Gemini Neural Hub...");

    // Send the image to our Gemini API proxy
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: imageSrc })
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Gemini Hub Offline");

    // Map Gemini response to our UI structure
    return {
      name: data.name || "Unknown Condition",
      confidence: data.confidence || "90%",
      status: data.status || 'healthy',
      severity: data.status === 'disease' ? 'high' : 'none',
      advice: data.advice || "No specific treatment required.",
      description: data.advice, // Gemini combines these
      treatment: data.advice,
      image_url: undefined // Gemini results are generative
    };

  } catch (err: any) {
    console.error("Gemini Analysis Error:", err);
    return {
      name: "Neural Link Error",
      confidence: "0%",
      status: 'healthy',
      severity: 'none',
      advice: "Ensure your Gemini API Key is active in Vercel settings.",
      description: "We encountered an error while reaching the Google Intelligence Hub.",
      treatment: "Please check your network or API configuration."
    };
  }
};
