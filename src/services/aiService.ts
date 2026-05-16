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
      // Show the specific 'details' from Google instead of a generic message
      const specificError = result.details || result.error || 'Unknown Google Hub Error';
      throw new Error(`Google API Reject: ${specificError}`);
    }

    return { ...result, status: 'success' };
  } catch (err: any) {
    console.error("Diagnostic Error:", err);
    throw err;
  }
};
