export interface DetectionResult {
  name: string;
  confidence: string;
  advice: string;
  severity: 'low' | 'medium' | 'high' | 'none';
  status?: 'loading' | 'success' | 'error';
}

const DISEASE_MAP: Record<string, { name: string, advice: string, severity: 'low' | 'medium' | 'high' | 'none' }> = {
  // Common classifications from ResNet and plant models
  "leaf": { name: "Healthy Foliage", advice: "The leaf appears healthy. Continue regular irrigation and ensure proper sunlight.", severity: "none" },
  "spotted": { name: "Leaf Spot Pathogen", advice: "Remove infected leaves. Apply organic neem oil or copper-based fungicide.", severity: "medium" },
  "wilting": { name: "Fusarium Wilt", advice: "Check soil moisture. If soil is wet, it may be root rot; if dry, increase watering.", severity: "high" },
  "powdery": { name: "Powdery Mildew", advice: "Improve air circulation. Spray a mix of water and baking soda or sulfur.", severity: "medium" },
  "yellow": { name: "Nutritional Deficiency", advice: "Check nitrogen and iron levels. Apply a balanced NPK fertilizer.", severity: "low" },
  "rust": { name: "Plant Rust", advice: "Prune affected areas immediately. Apply a sulfur-based dusting powder.", severity: "medium" },
  "blight": { name: "Blight detected", advice: "Highly contagious. Isolate plant and apply copper fungicide immediately.", severity: "high" }
};

export const analyzeLeaf = async (base64Image: string, onRetry?: (msg: string) => void, retryCount = 0): Promise<DetectionResult> => {
  try {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    });

    // Check for HTML response from Vercel before parsing
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Vercel Gateway is busy. Please try again in 5 seconds.");
    }

    const result = await response.json();

    if (response.status === 503 && retryCount < 5) {
      if (onRetry) onRetry("AI Hub is starting up...");
      await new Promise(r => setTimeout(r, 6000));
      return analyzeLeaf(base64Image, onRetry, retryCount + 1);
    }

    if (!response.ok) throw new Error(result.error || 'AI Bridge Timeout');

    if (Array.isArray(result) && result.length > 0) {
      const topMatch = result[0];
      const labelStr = topMatch.label.toLowerCase();
      
      // Smart fuzzy matching for disease names
      let match = { name: topMatch.label, advice: "Consult an expert for specific treatment.", severity: "medium" as const };
      for (const key in DISEASE_MAP) {
        if (labelStr.includes(key)) {
          match = DISEASE_MAP[key];
          break;
        }
      }

      return {
        name: match.name,
        confidence: (topMatch.score * 100).toFixed(1) + "%",
        advice: match.advice,
        severity: match.severity,
        status: 'success'
      };
    }

    throw new Error("AI returned empty data.");
  } catch (err: any) {
    return {
      name: "Neural Signal Lost",
      confidence: "0%",
      advice: `Status: ${err.message}. This usually happens when the image is too large or the AI model is sleeping.`,
      severity: "high",
      status: 'error'
    };
  }
};
