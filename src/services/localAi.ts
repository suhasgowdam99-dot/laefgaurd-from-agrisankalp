import { pipeline } from '@xenova/transformers';
import { supabase } from '../lib/supabase';

export interface DetectionResult {
  name: string;
  confidence: string;
  advice: string;
  severity: 'low' | 'medium' | 'high' | 'none';
  status: 'healthy' | 'disease';
  description?: string;
  treatment?: string;
  image_url?: string;
}

let pipe: any = null;

export const runCustomInference = async (imageSrc: string, onMsg?: (m: string) => void): Promise<DetectionResult> => {
  try {
    if (!pipe) {
      if (onMsg) onMsg("Loading Neural Vision Engine...");
      // Using CLIP ViT-B/32 for high-quality image embeddings
      pipe = await pipeline('feature-extraction', 'Xenova/clip-vit-base-patch32');
    }

    if (onMsg) onMsg("Extracting Visual Signature...");
    const output = await pipe(imageSrc);
    const embedding = Array.from(output.data);

    if (onMsg) onMsg("Searching Database...");
    // Search Supabase using the match_disease_images function
    const { data, error } = await supabase.rpc('match_disease_images', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 1
    });

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        name: "Unknown Signature",
        confidence: "0%",
        status: 'healthy',
        severity: 'none',
        advice: "No matching patterns found in our database.",
        description: "The captured image does not match any known diseases in our high-cost plant dataset.",
        treatment: "Continue regular monitoring."
      };
    }

    const match = data[0];
    const confidence = (match.similarity * 100).toFixed(1) + "%";

    return {
      name: match.name,
      confidence,
      status: 'disease',
      severity: match.similarity > 0.8 ? 'high' : 'medium',
      advice: match.treatment,
      description: match.description,
      treatment: match.treatment,
      image_url: match.image_url
    };

  } catch (err: any) {
    console.error("Vector Search Error:", err);
    return {
      name: "Processing Error",
      confidence: "0%",
      status: 'healthy',
      severity: 'none',
      advice: "Ensure your internet connection is stable.",
      description: "We encountered an error while processing the image signature.",
      treatment: "Please try again."
    };
  }
};
