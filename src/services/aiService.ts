import React from 'react';

export interface DetectionResult {
  name: string;
  confidence: string;
  advice: string;
  severity: 'low' | 'medium' | 'high' | 'none';
  status?: 'loading' | 'success' | 'error';
  source?: string;
}

export const analyzeLeaf = async (base64Image: string): Promise<DetectionResult> => {
  try {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.details || result.error || 'Neural Hub Timeout');
    }

    return {
      ...result,
      status: 'success'
    };

  } catch (err: any) {
    console.error("AI Hub Error:", err);
    return {
      name: "Scan Interrupted",
      confidence: "0%",
      advice: `Status: ${err.message}. Please check your GEMINI_API_KEY in Vercel.`,
      severity: "high",
      status: 'error'
    };
  }
};
