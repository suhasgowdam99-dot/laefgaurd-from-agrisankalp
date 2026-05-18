import * as tf from '@tensorflow/tfjs';

export interface DetectionResult {
  name: string;
  confidence: string;
  advice: string;
  severity: 'low' | 'medium' | 'high' | 'none';
  status?: 'success' | 'error';
}

// YOUR EXACT 28-CLASS TRAINING ORDER
const LABELS_28 = [
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
  "Pepper Bell Healthy",             // 19
  "Potato Early Blight",             // 20
  "Potato Healthy",                  // 21
  "Potato Late Blight",              // 22
  "Raspberry Healthy",               // 23
  "Soybean Healthy",                 // 24
  "Squash Powdery Mildew",           // 25
  "Strawberry Leaf Scorch",          // 26 (Assuming standard PlantVillage end)
  "Strawberry Healthy"               // 27
];

let customModel: tf.LayersModel | null = null;

export const analyzeWithCustomModel = async (imageSrc: string, onProgress?: (msg: string) => void): Promise<DetectionResult> => {
  try {
    if (!customModel) {
      if (onProgress) onProgress("Syncing Custom 28-Class Engine...");
      customModel = await tf.loadLayersModel('/model/model.json');
    }

    if (onProgress) onProgress("Neural Analysis in Progress...");
    
    const img = new Image();
    img.src = imageSrc;
    await new Promise(r => img.onload = r);

    const tensor = tf.browser.fromPixels(img)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(tf.scalar(255)) // Normalize pixels
      .expandDims();
    
    const predictions = await (customModel.predict(tensor) as tf.Tensor).data();
    const topIndex = Array.from(predictions).indexOf(Math.max(...Array.from(predictions)));
    
    const name = LABELS_28[topIndex] || "Unknown Specimen";
    const confidence = (predictions[topIndex] * 100).toFixed(1) + "%";
    const isHealthy = name.toLowerCase().includes('healthy');

    return {
      name: name,
      confidence: confidence,
      status: isHealthy ? 'healthy' : 'disease',
      severity: isHealthy ? 'none' : 'high',
      advice: isHealthy 
        ? "Plant shows optimal cell structure. No intervention required." 
        : `Detection: ${name}. Professional protocol suggests targeted pesticide application.`
    } as any;

  } catch (err: any) {
    console.error("Custom Engine Error:", err);
    throw new Error("Ensure model.json and bin files are in /public/model/");
  }
};
