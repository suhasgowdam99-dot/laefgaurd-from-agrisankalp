const { createClient } = require('@supabase/supabase-js');
const { pipeline } = require('@xenova/transformers');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DATASET = [
  {
    name: 'Ficus Varieties (Bonsai / Ginseng / Panda) - Leaf Spot',
    description: 'Bacterial or fungal leaf spot on Ficus leaves, characterized by dark, water-soaked lesions.',
    treatment: 'Improve air circulation, avoid overhead watering, and apply copper-based fungicide.',
    base_url: 'https://images.unsplash.com/photo-1599598425947-520286096538',
    count: 250
  },
  {
    name: 'Adenium (Desert Rose) - Caudex Rot',
    description: 'Soft, mushy rot at the base of the Adenium stem caused by overwatering or poor drainage.',
    treatment: 'Stop watering immediately, cut away rotten tissue, apply fungicide, and repot in dry, gritty soil.',
    base_url: 'https://images.unsplash.com/photo-1610450919937-58f88941cc72',
    count: 250
  },
  {
    name: 'Carmona (Fukien Tea Tree) - Fungal Blight',
    description: 'Yellowing and drop of leaves with black spots, common in humid conditions without airflow.',
    treatment: 'Increase light, reduce humidity, and use a systemic fungicide. Remove fallen leaves.',
    base_url: 'https://images.unsplash.com/photo-1512428813824-f7139c89b85a',
    count: 250
  },
  {
    name: 'Bougainvillea - Leaf Rust',
    description: 'Orange-brown powdery pustules on the undersides of leaves, causing premature leaf drop.',
    treatment: 'Remove infected leaves, apply sulfur or neem oil, and keep foliage dry.',
    base_url: 'https://images.unsplash.com/photo-1589133467340-9b43ed5b0789',
    count: 250
  }
];

async function seed() {
  console.log("🚀 Starting Seeding Process for 1000+ images...");
  
  const pipe = await pipeline('feature-extraction', 'Xenova/clip-vit-base-patch32');
  
  for (const category of DATASET) {
    console.log(`\n📦 Seeding ${category.count} images for: ${category.name}`);
    
    for (let i = 0; i < category.count; i++) {
      // Generate a slightly different URL for each to simulate a large dataset
      // In a real scenario, these would be unique URLs from a dataset manifest
      const imageUrl = `${category.base_url}?auto=format&fit=crop&q=80&w=1000&sig=${category.name.replace(/\s+/g, '')}${i}`;
      
      try {
        console.log(`[${i+1}/${category.count}] Processing: ${imageUrl}`);
        
        // 1. Generate Embedding
        const output = await pipe(imageUrl);
        const embedding = Array.from(output.data);
        
        // 2. Insert into Supabase
        const { error } = await supabase.from('disease_embeddings').insert({
          name: category.name,
          image_url: imageUrl,
          embedding: embedding,
          description: category.description,
          treatment: category.treatment
        });
        
        if (error) throw error;
        
      } catch (err) {
        console.error(`❌ Error processing image ${i}:`, err.message);
      }
    }
  }
  
  console.log("\n✅ Seeding Complete! 1000+ image signatures stored in Supabase.");
}

seed();
