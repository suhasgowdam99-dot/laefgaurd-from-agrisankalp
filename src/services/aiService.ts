export interface DetectionResult {
  name: string;
  confidence: string;
  advice: string;
  severity: 'low' | 'medium' | 'high' | 'none';
  status?: 'loading' | 'success' | 'error';
}

const DISEASE_MAP: Record<string, { name: string, advice: string, severity: 'low' | 'medium' | 'high' | 'none' }> = {
  "apple_scab": { name: "Apple Scab", advice: "Prune affected leaves and apply sulfur fungicides.", severity: "medium" },
  "apple_black_rot": { name: "Apple Black Rot", advice: "Remove cankers and infected fruit immediately.", severity: "high" },
  "apple_cedar_rust": { name: "Cedar Apple Rust", advice: "Apply myclobutanil fungicides and remove nearby junipers.", severity: "medium" },
  "apple_healthy": { name: "Healthy Apple", advice: "Plant is healthy. Maintain regular care.", severity: "none" },
  "corn_rust": { name: "Corn Common Rust", advice: "Use resistant hybrids and apply fungicides if needed.", severity: "low" },
  "corn_gray_spot": { name: "Corn Gray Leaf Spot", advice: "Improve tillage and use resistant seed varieties.", severity: "medium" },
  "corn_healthy": { name: "Healthy Corn", advice: "No disease detected. Ensure proper nitrogen levels.", severity: "none" },
  "grape_black_rot": { name: "Grape Black Rot", advice: "Apply copper-based fungicides after bloom.", severity: "high" },
  "grape_healthy": { name: "Healthy Grapes", advice: "Plant is flourishing. Continue monitoring.", severity: "none" },
  "potato_early_blight": { name: "Potato Early Blight", advice: "Rotate crops and apply chlorothalonil fungicides.", severity: "medium" },
  "potato_late_blight": { name: "Potato Late Blight", advice: "Critical: Remove plants and apply copper sprays.", severity: "high" },
  "potato_healthy": { name: "Healthy Potato", advice: "Plant is stable. No action required.", severity: "none" },
  "tomato_bacterial_spot": { name: "Tomato Bacterial Spot", advice: "Apply copper bactericide and avoid wet leaves.", severity: "medium" },
  "tomato_early_blight": { name: "Tomato Early Blight", advice: "Prune lower leaves and improve airflow.", severity: "medium" },
  "tomato_late_blight": { name: "Tomato Late Blight", advice: "Urgent: Destroy infected plants to save the crop.", severity: "high" },
  "tomato_leaf_mold": { name: "Tomato Leaf Mold", advice: "Reduce humidity and improve ventilation.", severity: "medium" },
  "tomato_healthy": { name: "Healthy Tomato", advice: "Vibrant and disease-free. Keep up the good work!", severity: "none" },
};

export const analyzeLeaf = async (base64Image: string, onRetry?: (msg: string) => void, retryCount = 0): Promise<DetectionResult> => {
  try {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    });

    const result = await response.json();

    if (response.status === 503 && retryCount < 6) {
      const msg = `AI Hub is warming up... (${retryCount + 1}/6)`;
      if (onRetry) onRetry(msg);
      await new Promise(r => setTimeout(r, 8000));
      return analyzeLeaf(base64Image, onRetry, retryCount + 1);
    }

    if (!response.ok) throw new Error(result.error || 'Server Error');

    if (Array.isArray(result) && result.length > 0) {
      const topMatch = result[0];
      const label = topMatch.label.toLowerCase().replace(/[^a-z_]/g, '');
      const confidence = (topMatch.score * 100).toFixed(1) + "%";
      
      const mappedData = DISEASE_MAP[label] || {
        name: topMatch.label.replace(/_/g, " "),
        advice: "Precision diagnosis complete. Please consult an agronomist for a detailed treatment plan.",
        severity: "medium"
      };

      return { ...mappedData, confidence, status: 'success' };
    }

    throw new Error("Invalid response from AI model.");
  } catch (err: any) {
    return {
      name: "Neural Hub Issue",
      confidence: "0%",
      advice: err.message,
      severity: "high",
      status: 'error'
    };
  }
};
