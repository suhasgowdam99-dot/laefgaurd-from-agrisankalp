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
      if (onMsg) onMsg("Syncing 20-Class Weights...");
      modelInstance = await tf.loadLayersModel('/model/model.json');
    }

    if (onMsg) onMsg("Calibrating Neural Layers...");
    
    const img = new Image();
    img.src = imageSrc;
    await new Promise(r => img.onload = r);

    // Pre-processing
    const tensor = tf.tidy(() => {
      const pixels = tf.browser.fromPixels(img);
      const resized = tf.image.resizeBilinear(pixels, [224, 224]);
      const normalized = resized.div(255.0);
      return normalized.expandDims(0);
    });

    if (onMsg) onMsg("Extracting Botanical Features...");
    const prediction = modelInstance.predict(tensor) as tf.Tensor;
    const scores = await prediction.data();
    tensor.dispose();
    prediction.dispose();

    const maxIndex = scores.indexOf(Math.max(...Array.from(scores)));
    const name = LABELS_20[maxIndex] || "Unknown Specimen";
    const confidence = (scores[maxIndex] * 100).toFixed(1) + "%";
    const isHealthy = name.toLowerCase().includes('healthy');

    return {
      name,
      confidence,
      status: isHealthy ? 'healthy' : 'disease',
      severity: isHealthy ? 'none' : 'high',
      advice: isHealthy 
        ? "Neural patterns confirm optimal health. No pathogens detected."
        : `Pathogen detected: ${name}. Implement localized protocol immediately.`
    };
  } catch (err) {
    console.error(err);
    throw new Error("Model files missing in /public/model/");
  }
};
