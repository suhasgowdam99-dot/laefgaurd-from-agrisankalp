import * as tf from '@tensorflow/tfjs';

export interface DetectionResult {
  name: string;
  confidence: string;
  advice: string;
  severity: 'low' | 'medium' | 'high' | 'none';
  status: 'healthy' | 'disease';
}

const LABELS_20 = [
  "Apple Scab", "Apple Black Rot", "Apple Cedar Rust", "Apple Healthy",
  "Blueberry Healthy", "Cherry Healthy", "Cherry Powdery Mildew",
  "Corn Gray Leaf Spot", "Corn Common Rust", "Corn Healthy", "Corn Northern Leaf Blight",
  "Grape Black Rot", "Grape Esca", "Grape Healthy", "Grape Leaf Blight",
  "Orange Citrus Greening", "Peach Bacterial Spot", "Peach Healthy",
  "Pepper Bell Bacterial Spot", "Pepper Bell Healthy"
];

let modelInstance: tf.LayersModel | null = null;

export const runCustomInference = async (imageSrc: string, onMsg?: (m: string) => void): Promise<DetectionResult> => {
  try {
    if (!modelInstance) {
      if (onMsg) onMsg("Waking Up Neural Engine...");
      modelInstance = await tf.loadLayersModel('/model/model.json');
      
      // Warm up the model with a zero tensor to initialize GPU memory
      const dummy = tf.zeros([1, 224, 224, 3]);
      modelInstance.predict(dummy);
      dummy.dispose();
    }

    if (onMsg) onMsg("Extracting Pixel Data...");
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    await new Promise(r => img.onload = r);

    // CRITICAL FIX: Robust Pre-processing
    const result = tf.tidy(() => {
      // 1. Convert to pixels
      const pixels = tf.browser.fromPixels(img);
      
      // 2. Resize to the 224x224 size your model was trained on
      const resized = tf.image.resizeBilinear(pixels, [224, 224]);
      
      // 3. Normalize: Scale 0-255 to 0-1 (Most common for these models)
      const normalized = resized.toFloat().div(tf.scalar(255.0));
      
      // 4. Create batch dimension [1, 224, 224, 3]
      const batched = normalized.expandDims(0);
      
      if (onMsg) onMsg("Running Neural Comparison...");
      const prediction = modelInstance!.predict(batched) as tf.Tensor;
      
      // Get data as a standard array
      const scores = prediction.dataSync();
      const maxIndex = scores.indexOf(Math.max(...Array.from(scores)));
      
      // Debug logging: See the raw scores in your F12 console
      console.log("Neural Probabilities:", Array.from(scores));
      
      const name = LABELS_20[maxIndex] || "Unknown Specimen";
      const confidence = (scores[maxIndex] * 100).toFixed(1) + "%";
      const isHealthy = name.toLowerCase().includes('healthy');

      return {
        name,
        confidence,
        status: isHealthy ? 'healthy' : 'disease',
        severity: isHealthy ? 'none' : 'high',
        advice: isHealthy 
          ? "No pathogenic patterns found. Maintain regular monitoring."
          : `Match Found: ${name}. Implement localized cure protocol immediately.`
      };
    });

    return result as DetectionResult;

  } catch (err: any) {
    console.error("Neural Logic Failure:", err);
    throw new Error("Could not process image. Ensure model files are in /public/model/");
  }
};
