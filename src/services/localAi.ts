import * as tf from '@tensorflow/tfjs';

export interface DetectionResult {
  name: string;
  confidence: string;
  advice: string;
  severity: 'low' | 'medium' | 'high' | 'none';
  status: 'healthy' | 'disease';
}

// YOUR EXACT TRAINING ORDER (19 CLASSES)
const LABELS_19 = [
  "Apple Scab",                     // 0
  "Apple Black Rot",                 // 1
  "Apple Cedar Rust",                // 2
  "Apple Healthy",                   // 3
  "Blueberry Healthy",               // 4
  "Cherry Healthy",                  // 5
  "Cherry Powdery Mildew",           // 6
  "Corn Gray Leaf Spot",             // 7
  "Corn Common Rust",                // 8
  "Corn Healthy",                    // 9
  "Corn Northern Leaf Blight",       // 10
  "Grape Black Rot",                 // 11
  "Grape Esca (Black Measles)",      // 12
  "Grape Healthy",                   // 13
  "Grape Leaf Blight",               // 14
  "Citrus Greening (Orange)",        // 15
  "Peach Bacterial Spot",            // 16
  "Pepper Bell Bacterial Spot",      // 17
  "Pepper Bell Healthy"              // 18
];

let modelInstance: tf.LayersModel | null = null;

export const runCustomInference = async (imageSrc: string, onMsg?: (m: string) => void): Promise<DetectionResult> => {
  try {
    if (!modelInstance) {
      if (onMsg) onMsg("Waking Up Neural Engine...");
      // Explicitly set backend for stability
      await tf.setBackend('webgl').catch(() => tf.setBackend('cpu'));
      modelInstance = await tf.loadLayersModel('/model/model.json');
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    await new Promise(r => img.onload = r);

    // CRITICAL: Robust Neural Pre-processing
    const result = tf.tidy(() => {
      // 1. Convert to pixels and ensure 3 channels (RGB)
      const pixels = tf.browser.fromPixels(img).cast('float32') as tf.Tensor3D;
      
      // 2. Resize to exact input dimensions (224x224)
      const resized = tf.image.resizeBilinear(pixels, [224, 224]);
      
      // 3. Normalization logic used by 99% of agritech models (0-1 range)
      const offset = tf.scalar(255.0);
      const normalized = resized.div(offset);
      
      // 4. Reshape to [1, 224, 224, 3]
      const batched = normalized.expandDims(0);
      
      if (onMsg) onMsg("Running Custom Diagnostics...");
      const prediction = modelInstance!.predict(batched) as tf.Tensor;
      const scores = prediction.dataSync();

      // Find the winner
      const maxIndex = scores.indexOf(Math.max(...Array.from(scores)));
      const confidenceScore = scores[maxIndex];

      console.log("Neural Signal Strength:", Array.from(scores));

      const name = LABELS_19[maxIndex] || "Unknown Pattern";
      const confidence = (confidenceScore * 100).toFixed(1) + "%";
      const isHealthy = name.toLowerCase().includes('healthy');

      return {
        name,
        confidence,
        status: isHealthy ? 'healthy' : 'disease',
        severity: isHealthy ? 'none' : 'high',
        advice: isHealthy 
          ? "No pathogenic signatures detected. Cell structure is optimal."
          : `Alert: ${name} identified. Implement localized protocol immediately.`
      };
    });

    return result as DetectionResult;

  } catch (err: any) {
    console.error("Neural Error:", err);
    throw new Error("Ensure model.json and bin files are correctly placed in /public/model/");
  }
};
