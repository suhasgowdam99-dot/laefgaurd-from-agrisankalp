import React from 'react';

export interface DetectionResult {
  name: string;
  confidence: string;
  advice: string;
  severity: 'low' | 'medium' | 'high' | 'none';
  status?: 'loading' | 'success' | 'error';
}

const DISEASE_MAP: Record<string, { name: string, advice: string, severity: 'low' | 'medium' | 'high' | 'none' }> = {
  "apple___apple_scab": { name: "Apple Scab", advice: "Prune affected leaves and apply sulfur fungicides.", severity: "medium" },
  "apple___black_rot": { name: "Apple Black Rot", advice: "Remove cankers and infected fruit immediately.", severity: "high" },
  "apple___cedar_apple_rust": { name: "Cedar Apple Rust", advice: "Apply myclobutanil fungicides and remove nearby junipers.", severity: "medium" },
  "apple___healthy": { name: "Healthy Apple", advice: "Plant is healthy. Maintain regular care.", severity: "none" },
  "corn_(maize)___common_rust_": { name: "Corn Common Rust", advice: "Use resistant hybrids and apply fungicides if needed.", severity: "low" },
  "corn_(maize)___healthy": { name: "Healthy Corn", advice: "No disease detected. Ensure proper nitrogen levels.", severity: "none" },
  "grape___black_rot": { name: "Grape Black Rot", advice: "Apply copper-based fungicides after bloom.", severity: "high" },
  "grape___healthy": { name: "Healthy Grapes", advice: "Plant is flourishing. Continue monitoring.", severity: "none" },
  "potato___early_blight": { name: "Potato Early Blight", advice: "Rotate crops and apply chlorothalonil fungicides.", severity: "medium" },
  "potato___late_blight": { name: "Potato Late Blight", advice: "Critical: Remove plants and apply copper sprays.", severity: "high" },
  "potato___healthy": { name: "Healthy Potato", advice: "Plant is stable. No action required.", severity: "none" },
  "tomato___bacterial_spot": { name: "Tomato Bacterial Spot", advice: "Apply copper bactericide and avoid wet leaves.", severity: "medium" },
  "tomato___early_blight": { name: "Tomato Early Blight", advice: "Prune lower leaves and improve airflow.", severity: "medium" },
  "tomato___late_blight": { name: "Tomato Late Blight", advice: "Urgent: Destroy infected plants to save the crop.", severity: "high" },
  "tomato___leaf_mold": { name: "Tomato Leaf Mold", advice: "Reduce humidity and improve ventilation.", severity: "medium" },
  "tomato___healthy": { name: "Healthy Tomato", advice: "Vibrant and disease-free. Keep up the good work!", severity: "none" },
};

export const analyzeLeaf = async (base64Image: string, onRetry?: (msg: string) => void, retryCount = 0): Promise<DetectionResult> => {
  try {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    });

    const result = await response.json();

    // 1. Handle Model Loading (503)
    if (response.status === 503 && retryCount < 6) {
      const msg = `AI Hub is warming up... (${retryCount + 1}/6)`;
      if (onRetry) onRetry(msg);
      await new Promise(r => setTimeout(r, 8000));
      return analyzeLeaf(base64Image, onRetry, retryCount + 1);
    }

    // 2. Handle Explicit Errors from our Bridge
    if (!response.ok) {
      throw new Error(result.details || result.error || 'AI Bridge rejected the request');
    }

    // 3. Process Success
    if (Array.isArray(result) && result.length > 0) {
      const topMatch = result[0];
      const label = topMatch.label.toLowerCase();
      const confidence = (topMatch.score * 100).toFixed(1) + "%";
      
      const mappedData = DISEASE_MAP[label] || {
        name: topMatch.label.replace(/___/g, " ").replace(/_/g, " "),
        advice: "Neural analysis complete. Patterns suggest specific pathogen activity. Consult an agronomist.",
        severity: "medium"
      };

      return { ...mappedData, confidence, status: 'success' };
    }

    throw new Error("AI Hub returned an empty result.");
  } catch (err: any) {
    console.error("Diagnostic Error:", err);
    return {
      name: "Diagnosis Error",
      confidence: "0%",
      advice: `Technical Details: ${err.message}. If this persists, verify your HF Token in Vercel settings.`,
      severity: "high",
      status: 'error'
    };
  }
};
