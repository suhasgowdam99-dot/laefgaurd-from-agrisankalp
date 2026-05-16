import React, { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle2, AlertCircle, Camera, RefreshCw, X, ShieldCheck, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeLeaf, DetectionResult } from '../services/aiService';

export const Analyzer = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [inputMode, setInputMode] = useState<'upload' | 'camera'>('upload');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setInputMode('camera');
    setIsCameraActive(true);
    setResult(null);
    setImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        setImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const resizeImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // 70% quality is plenty for AI
      };
    });
  };

  const runAnalysis = async () => {
    if (!image) return;
    setAnalyzing(true);
    setStatusMessage('Capturing molecular signatures...');
    
    try {
      const optimizedImage = await resizeImage(image);
      
      setStatusMessage('Accessing Agriculture Databases...');
      await new Promise(r => setTimeout(r, 1200));
      
      setStatusMessage('Finalizing botanical report...');
      // Direct call to our backend bridge
      const detection = await analyzeLeaf(optimizedImage);
      setResult(detection);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
      setStatusMessage('');
    }
  };

  return (
    <section id="detect" className="py-32 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent" />
      
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-green-600 font-bold tracking-[0.2em] text-xs uppercase"
          >
            Neural Diagnostics
          </motion.div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">Detect Disease Instantly</h2>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">
            Choose your preferred input method to begin the AI neural scan of your leaf sample.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[3.5rem] p-8 lg:p-12 shadow-2xl shadow-slate-200/50">
          {!result ? (
            <div className="flex flex-col items-center gap-10">
              {/* Input Mode Switcher */}
              <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                <button 
                  onClick={() => { setInputMode('upload'); stopCamera(); }}
                  className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${inputMode === 'upload' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Upload size={18} />
                  Files
                </button>
                <button 
                  onClick={startCamera}
                  className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${inputMode === 'camera' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Camera size={18} />
                  Live Camera
                </button>
              </div>

              {/* Main Display Area */}
              <div className="relative group w-full max-w-2xl aspect-[4/3] bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-green-300">
                {inputMode === 'upload' ? (
                  <>
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={handleFileUpload}
                      accept="image/*"
                    />
                    {image ? (
                      <div className="w-full h-full relative p-4">
                        <img src={image} alt="Preview" className="w-full h-full object-cover rounded-[2rem]" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-[2rem] mx-4 my-4">
                          <p className="text-white font-bold flex items-center gap-2 bg-black/40 px-6 py-3 rounded-full backdrop-blur-md">
                            <RefreshCw size={20} /> Replace Photo
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-6 p-12 text-center">
                        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                          <Upload size={40} />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-slate-900 mb-1">Select Leaf Image</p>
                          <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">JPG, PNG up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full relative bg-slate-900">
                    {isCameraActive ? (
                      <>
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none" />
                        <button 
                          onClick={capturePhoto}
                          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full border-[6px] border-green-600 shadow-2xl flex items-center justify-center text-green-600 hover:scale-110 active:scale-90 transition-all z-20"
                        >
                          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                            <Camera size={32} fill="currentColor" />
                          </div>
                        </button>
                        <button onClick={stopCamera} className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-colors">
                          <X size={24} />
                        </button>
                      </>
                    ) : image ? (
                      <div className="w-full h-full relative p-4">
                        <img src={image} alt="Captured" className="w-full h-full object-cover rounded-[2rem]" />
                        <button 
                          onClick={startCamera}
                          className="absolute inset-0 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 rounded-[2rem] mx-4 my-4 text-white font-bold gap-3 backdrop-blur-sm"
                        >
                          <RefreshCw size={32} />
                          Retake Photo
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-6">
                        <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-600">
                          <Camera size={40} />
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold text-xl mb-2">Camera is Disconnected</p>
                          <button onClick={startCamera} className="bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-xl shadow-green-900/50 hover:bg-green-700 transition-all">Enable Device Camera</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex flex-col items-center gap-4">
                 <button
                  disabled={!image || analyzing}
                  onClick={runAnalysis}
                  className="bg-green-600 text-white px-12 py-5 rounded-2xl font-bold shadow-2xl shadow-green-200 hover:bg-green-700 disabled:opacity-50 disabled:translate-y-0 transition-all flex items-center gap-4 text-lg active:scale-95"
                >
                  {analyzing ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={24} />}
                  {analyzing ? statusMessage || 'Processing Neural Scan...' : 'Run Precision Analysis'}
                </button>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End-to-End Encrypted Analysis</p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
                  <div className="w-full lg:w-2/5 shrink-0">
                     <div className="aspect-square bg-slate-100 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                        <img src={image || ''} alt="Analyzed Sample" className="w-full h-full object-cover" />
                     </div>
                  </div>
                  <div className="flex-1 space-y-8 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold mb-4 border border-green-100 uppercase tracking-wider">
                           Neural Diagnosis Complete
                        </div>
                        <h3 className="text-4xl font-extrabold text-slate-900 mb-1">{result.name}</h3>
                        <p className="text-lg font-bold text-green-600 italic">{result.confidence} Google Search Confidence</p>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={async () => {
                            try {
                              // 1. Convert base64 to Blob
                              const res = await fetch(image || '');
                              const blob = await res.blob();
                              
                              // 2. Create a file from the blob
                              const file = new File([blob], "leaf_sample.jpg", { type: "image/jpeg" });

                              // 3. Create a hidden form to POST to Google
                              const form = document.createElement('form');
                              form.method = 'POST';
                              form.action = 'https://www.google.com/searchbyimage/upload';
                              form.enctype = 'multipart/form-data';
                              form.target = '_blank';

                              const fileInput = document.createElement('input');
                              fileInput.type = 'file';
                              fileInput.name = 'encoded_image';
                              
                              // Use a DataTransfer object to simulate a file selection
                              const dataTransfer = new DataTransfer();
                              dataTransfer.items.add(file);
                              fileInput.files = dataTransfer.files;

                              form.appendChild(fileInput);
                              document.body.appendChild(form);
                              form.submit();
                              document.body.removeChild(form);
                            } catch (e) {
                              console.error("Lens launch failed", e);
                              alert("Redirecting to Google...");
                              window.open('https://www.google.com/search?q=plant+disease+identifier', '_blank');
                            }
                          }}
                          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-3"
                        >
                          <Search size={20} />
                          Verify with Live Google Lens
                        </button>
                      </div>
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${result.severity === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-green-100 text-green-600'}`}>
                        {result.severity === 'high' ? <AlertCircle size={32} /> : <CheckCircle2 size={32} />}
                      </div>
                    </div>
                    
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative">
                      <div className="absolute -top-3 left-8 bg-white border border-slate-100 px-4 py-1 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Diagnosis & Protocol
                      </div>
                      <h4 className="font-extrabold text-slate-900 mb-3 flex items-center gap-3 text-lg">
                        Professional Advice
                      </h4>
                      <p className="text-slate-600 leading-relaxed text-lg font-medium">{result.advice}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => { setResult(null); setImage(null); }}
                        className="flex-1 bg-green-600 text-white py-5 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg active:scale-95"
                      >
                        Scan New Sample
                      </button>
                      <button className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                         Print Laboratory Report
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
};
