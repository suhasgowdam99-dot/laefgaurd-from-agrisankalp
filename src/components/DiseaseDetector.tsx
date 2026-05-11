import React, { useState, useRef } from 'react';
import { analyzeLeaf } from '../lib/gemini';

const DiseaseDetector: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysis(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setLoading(true);
    setError(null);
    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const result = await analyzeLeaf(arrayBuffer, imageFile.type);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <section id="detector" className="detector-section">
      <div className="container">
        <div className="section-header">
          <span className="badge">AI Diagnosis</span>
          <h2>Instant Leaf Disease Detection</h2>
          <p>Upload a photo of your plant's leaf, and our Gemini-powered AI will identify diseases and suggest treatments in seconds.</p>
        </div>

        <div className="detector-container">
          <div className="upload-box" onClick={triggerFileInput}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            {selectedImage ? (
              <img src={selectedImage} alt="Selected leaf" className="preview-image" />
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">📸</div>
                <p>Click to upload or drag and drop</p>
                <span>JPG, PNG up to 5MB</span>
              </div>
            )}
          </div>

          <div className="analysis-box">
            {!selectedImage && !analysis && (
              <div className="empty-state">
                <p>Upload an image to start the clinical analysis.</p>
              </div>
            )}

            {selectedImage && !analysis && !loading && (
              <div className="action-state">
                <button className="btn-primary" onClick={handleAnalyze}>
                  Start Analysis
                </button>
              </div>
            )}

            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Analyzing leaf patterns and symptoms...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <p>⚠️ {error}</p>
                <button className="btn-secondary" onClick={() => setError(null)}>Retry</button>
              </div>
            )}

            {analysis && (
              <div className="results-state">
                <h3>Diagnosis Report</h3>
                <div className="analysis-content">
                  {analysis.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                <button className="btn-secondary" onClick={() => {
                  setSelectedImage(null);
                  setImageFile(null);
                  setAnalysis(null);
                }}>
                  New Scan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiseaseDetector;
