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
      throw new Error(result.details || result.error || 'The Google Knowledge link failed.');
    }

    return { ...result, status: 'success' };
  } catch (err: any) {
    console.error("Real Error Fetching Result:", err);
    // CRITICAL: We throw the error so the UI shows the red error box 
    // instead of showing a 'fake' healthy result.
    throw err;
  }
};
