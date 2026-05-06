import React from 'react';

export interface DetectionResult {
  name: string;
  confidence: string;
  advice: string;
  severity: 'low' | 'medium' | 'high' | 'none';
  status?: 'loading' | 'success' | 'error';
}

export const analyzeLeaf = async (base64Image: string, onRetry?: (msg: string) => void): Promise<DetectionResult> => {
  try {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.details || result.error || 'Gemini Bridge rejected the request');
    }

    // Gemini returns the mapped object directly from our prompt
    return {
      ...result,
      status: 'success'
    };

  } catch (err: any) {
    console.error("Gemini Error:", err);
    return {
      name: "Neural Signal Error",
      confidence: "0%",
      advice: `Technical Details: ${err.message}. Ensure your GEMINI_API_KEY is correctly set in Vercel.`,
      severity: "high",
      status: 'error'
    };
  }
};
