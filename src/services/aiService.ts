export interface DetectionResult {
  name: string;
  confidence: string;
  advice: string;
  severity: 'low' | 'medium' | 'high' | 'none';
  status?: 'loading' | 'success' | 'error';
  message?: string;
}

const DISEASE_MAP: Record<string, { name: string, advice: string, severity: 'low' | 'medium' | 'high' | 'none' }> = {
  "Apple___Apple_scab": { name: "Apple Scab", advice: "Prune affected leaves and apply sulfur-based fungicides.", severity: "medium" },
  "Apple___Black_rot": { name: "Apple Black Rot", advice: "Remove cankers and infected fruit. Apply lime-sulfur spray.", severity: "high" },
  "Apple___Cedar_apple_rust": { name: "Cedar Apple Rust", advice: "Remove nearby juniper trees. Apply myclobutanil.", severity: "medium" },
  "Apple___healthy": { name: "Healthy Apple Leaf", advice: "Maintain regular nutrition and watering.", severity: "none" },
  "Corn_(maize)___Common_rust_": { name: "Corn Common Rust", advice: "Plant resistant varieties. Use fungicides if needed.", severity: "low" },
  "Corn_(maize)___healthy": { name: "Healthy Corn Leaf", advice: "No action needed. Ensure proper nitrogen.", severity: "none" },
  "Grape___Black_rot": { name: "Grape Black Rot", advice: "Remove mummified fruit. Apply copper fungicides.", severity: "high" },
  "Grape___healthy": { name: "Healthy Grape Leaf", advice: "Maintain current care. Monitor regularly.", severity: "none" },
  "Potato___Early_blight": { name: "Potato Early Blight", advice: "Rotate crops. Apply mancozeb fungicides.", severity: "medium" },
  "Potato___Late_blight": { name: "Potato Late Blight", advice: "Destroy infected plants. Apply copper fungicides.", severity: "high" },
  "Tomato___Bacterial_spot": { name: "Tomato Bacterial Spot", advice: "Apply copper bactericide. Avoid handling when wet.", severity: "medium" },
  "Tomato___Early_blight": { name: "Tomato Early Blight", advice: "Prune lower leaves. Apply chlorothalonil.", severity: "medium" },
  "Tomato___Late_blight": { name: "Tomato Late Blight", advice: "Remove infected plants. Apply copper fungicides.", severity: "high" },
  "Tomato___healthy": { name: "Healthy Tomato Leaf", advice: "Ensure consistent moisture and support.", severity: "none" },
};

export const analyzeLeaf = async (base64Image: string, onRetry?: (msg: string) => void, retryCount = 0): Promise<DetectionResult> => {
  try {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    });

    const result = await response.json();

    // Handle Proxy reporting Model Loading (503)
    if (response.status === 503 && retryCount < 6) {
      const waitTime = Math.round(result.estimated_time || 10);
      const msg = `AI is waking up... (${waitTime}s remaining)`;
      if (onRetry) onRetry(msg);
      await new Promise(r => setTimeout(r, 8000));
      return analyzeLeaf(base64Image, onRetry, retryCount + 1);
    }

    if (!response.ok) {
      throw new Error(result.error || `Server Error (${response.status})`);
    }

    if (Array.isArray(result) && result.length > 0) {
      const topMatch = result[0];
      const label = topMatch.label;
      const confidence = (topMatch.score * 100).toFixed(1) + "%";
      
      const mappedData = DISEASE_MAP[label] || {
        name: label.replace(/___/g, " ").replace(/_/g, " "),
        advice: "Specialized neural diagnosis required. Consult an agronomist.",
        severity: "medium"
      };

      return { ...mappedData, confidence, status: 'success' };
    }

    throw new Error("Invalid AI response structure");
  } catch (err: any) {
    console.error("Analysis Proxy Error:", err);
    return {
      name: "Neural Scan Error",
      confidence: "0%",
      advice: err.message,
      severity: "high",
      status: 'error'
    };
  }
};
