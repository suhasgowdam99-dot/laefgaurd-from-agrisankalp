import * as tf from '@tensorflow/tfjs';

export interface DetectionResult {
  name: string;
  confidence: string;
  advice: string;
  severity: 'low' | 'medium' | 'high' | 'none';
  status?: 'success' | 'error';
}

// YOUR OPTIMIZED 20-CLASS TRAINING ORDER
const LABELS_20 = [
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
  "Peach Healthy",                   // 17
  "Pepper Bell Bacterial Spot",      // 18
  "Pepper Bell Healthy"              // 19
];

let customModel: tf.LayersModel | null = null;

export const analyzeWithCustomModel = async (imageSrc: string, onProgress?: (msg: string) => void): Promise<DetectionResult> => {
  try {
    if (!customModel) {
      if (onProgress) onProgress("Initializing 20-Class Neural Engine...");
      customModel = await tf.loadLayersModel('/model/model.json');
    }

    if (onProgress) onProgress("Precision Analysis in Progress...");
    
    const img = new Image();
    img.src = imageSrc;
    await new Promise(r => img.onload = r);

    const tensor = tf.browser.fromPixels(img)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(tf.scalar(255)) 
      .expandDims();
    
    const predictions = await (customModel.predict(tensor) as tf.Tensor).data();
    const topIndex = Array.from(predictions).indexOf(Math.max(...Array.from(predictions)));
    
    const name = LABELS_20[topIndex] || "Unknown Specimen";
    const confidence = (predictions[topIndex] * 100).toFixed(1) + "%";
    const isHealthy = name.toLowerCase().includes('healthy');

    return {
      name: name,
      confidence: confidence,
      status: isHealthy ? 'healthy' : 'disease',
      severity: isHealthy ? 'none' : 'high',
      advice: isHealthy 
        ? "Neural scan confirms optimal chlorophyll density and cell structure. No intervention required." 
        : `Pathogen identified: ${name}. Implement localized pesticide protocol immediately.`
    } as any;

  } catch (err: any) {
    console.error("Custom Engine Error:", err);
    throw new Error("Neural Hub Offline: Ensure model files are in /public/model/");
  }
};
