# LeafGuard - 4 Costly Plant Disease Detection

LeafGuard is a precision agritech platform focused on the detection and management of 4 costly plant varieties: Ficus, Adenium, Carmona, and Bougainvillea. It combines computer vision with a real-time Supabase botanical database to provide accurate diagnostics and treatment protocols.

## 🚀 Key Features
- **4 Costly Plants Focus**: Specialized detection for high-value botanical assets.
- **Supabase Integration**: Real-time fetching of disease descriptions and treatment protocols.
- **AI Neural Diagnosis**: Browser-based TensorFlow.js model for leaf analysis.
- **Precision UI**: Modern, responsive design built with React, Vite, and Tailwind CSS.

## 🛠️ Setup Instructions

### 1. Supabase Configuration
- Create a project at [Supabase](https://supabase.com).
- Run the SQL found in `setup_supabase.sql` in your Supabase SQL Editor.
- Copy your **Supabase URL** and **Anon Key**.
- Create a `.env` file in the root directory:
  ```env
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```

### 2. Local Installation
```bash
npm install
npm run dev
```

### 3. Model Files
- Place your TensorFlow.js model files (`model.json` and `.bin` shards) in the `public/model/` directory.

## 🏗️ Deployment (Vercel)
1. Push this repository to GitHub.
2. Connect the repository to [Vercel](https://vercel.com).
3. Add the following Environment Variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## 🧪 Supported Plants
1. **Ficus Varieties (Bonsai / Ginseng / Panda)**
2. **Adenium (Desert Rose)**
3. **Carmona (Fukien Tea Tree)**
4. **Bougainvillea**

---
© 2026 LeafGuard From Agrisankalp. Built with precision for the future of agriculture.
