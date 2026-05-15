import React from 'react';

export interface DetectionResult {
  name: string;
  confidence: string;
  advice: string;
  severity: 'low' | 'medium' | 'high' | 'none';
  status?: 'loading' | 'success' | 'error';
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
      throw new Error(result.details || result.error || 'Server Internal Error');
    }

    return { ...result, status: 'success' };

  } catch (err: any) {
    console.error("Vercel Logic Error:", err);
    return {
      name: "Deployment Diagnostic",
      confidence: "0%",
      advice: `Vercel Status: ${err.message}. To debug, visit /api/predict in your browser.`,
      severity: "high",
      status: 'error'
    };
  }
};
