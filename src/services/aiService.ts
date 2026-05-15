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
      // Show the 'advice' from the backend which contains the real Google error
      throw new Error(result.advice || result.details || 'Neural Hub Timeout');
    }

    return { ...result, status: 'success' };
  } catch (err: any) {
    return {
      name: "Analysis Error",
      confidence: "0%",
      advice: err.message,
      severity: "high",
      status: 'error'
    };
  }
};
