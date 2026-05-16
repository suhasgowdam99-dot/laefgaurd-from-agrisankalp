import React from 'react';

export interface DetectionResult {
  name: string;
  confidence: string;
  advice: string;
  status: 'disease' | 'healthy';
  error?: boolean;
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
      throw new Error(result.details || result.advice || 'Google Hub Failure');
    }

    return result;

  } catch (err: any) {
    console.error("Neural Error:", err);
    return {
      name: "Search Failure",
      confidence: "0%",
      status: 'healthy',
      advice: `Error: ${err.message}. Make sure your API key has 'Generative Language API' ENABLED in Google Cloud Console.`,
      error: true
    };
  }
};
