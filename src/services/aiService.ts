import React from 'react';

export interface DetectionResult {
  name: string;
  confidence: string;
  advice: string;
  severity: 'low' | 'medium' | 'high' | 'none';
  status?: 'success' | 'error';
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
      throw new Error(result.advice || result.details || 'Gemini link failure');
    }

    return { ...result, status: 'success' };
  } catch (err: any) {
    console.error(err);
    return {
      name: "Neural Error",
      confidence: "0%",
      advice: `Critical: ${err.message}. Ensure GEMINI_API_KEY is in Vercel and redeployed.`,
      severity: "high",
      status: 'error'
    };
  }
};
