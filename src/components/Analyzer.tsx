import React, { useState, useRef } from 'react';
import { Upload, Camera, RefreshCw, X, Search, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const Analyzer = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [inputMode, setInputMode] = useState<'upload' | 'camera'>('upload');
  const [spraying, setSpraying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setInputMode('camera');
    setIsCameraActive(true);
    setImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Please allow camera access.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0);
      setImage(canvasRef.current.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  const launchGoogleLens = async () => {
    if (!image) return;
    
    try {
      // 1. Convert base64 to Blob
      const res = await fetch(image);
      const blob = await res.blob();
      const file = new File([blob], "leaf_sample.jpg", { type: "image/jpeg" });

      // 2. Prepare hidden form for Google
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://www.google.com/searchbyimage/upload';
      form.enctype = 'multipart/form-data';
      form.target = '_blank';

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.name = 'encoded_image';
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;

      form.appendChild(fileInput);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch (e) {
      window.open('https://www.google.com/search?q=plant+disease+identification', '_blank');
    }
  };

  const triggerSprayer = async () => {
    setSpraying(true);
    try {
      // Direct link to your ThingSpeak bridge
      await fetch('/api/iot?action=spray&status=1');
      alert("Sprayer Triggered Successfully!");
    } catch (e) {
      alert("ThingSpeak Connection Offline.");
    } finally {
      setTimeout(() => setSpraying(false), 3000);
    }
  };

  return (
    <section id="detect" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Laboratory Diagnostics</h2>
          <p className="text-slate-500 font-medium">Capture a photo to identify plant health directly via Google Lens</p>
        </div>

        <div className="bg-green-50/50 border-2 border-dashed border-green-200 rounded-[3rem] p-12">
          {!image && !isCameraActive ? (
            <div className="flex flex-col items-center gap-8">
               <div className="flex gap-4 p-1.5 bg-white border border-green-100 rounded-2xl shadow-sm">
                <button onClick={() => setInputMode('upload')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${inputMode === 'upload' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400'}`}>Upload File</button>
                <button onClick={startCamera} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${inputMode === 'camera' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400'}`}>Camera</button>
              </div>

              {inputMode === 'upload' ? (
                <div className="relative group w-full max-w-md aspect-video bg-white rounded-3xl border border-green-100 shadow-sm flex flex-col items-center justify-center overflow-hidden cursor-pointer">
                  <input type="file" className="absolute inset-0 opacity-0 z-10" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setImage(ev.target?.result as string);
                      reader.readAsDataURL(f);
                    }
                  }} />
                  <Upload size={32} className="text-green-600 mb-2" />
                  <p className="font-bold text-slate-900">Choose Leaf Image</p>
                </div>
              ) : (
                <button onClick={startCamera} className="w-full max-w-md aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-white gap-4 shadow-2xl">
                  <Camera size={48} />
                  <span className="font-bold">Start Device Camera</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              <div className="relative max-w-2xl mx-auto aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                {isCameraActive ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <button onClick={capturePhoto} className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-green-600 shadow-xl" />
                    <button onClick={stopCamera} className="absolute top-6 right-6 p-2 bg-black/40 text-white rounded-full"><X size={20}/></button>
                  </>
                ) : (
                  <>
                    <img src={image || ''} className="w-full h-full object-cover" />
                    <button onClick={() => { setImage(null); setIsCameraActive(false); }} className="absolute top-6 right-6 p-2 bg-black/60 text-white rounded-full"><RefreshCw size={20}/></button>
                  </>
                )}
              </div>

              {!isCameraActive && (
                <div className="flex flex-col items-center gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                    <button onClick={launchGoogleLens} className="bg-green-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-green-700 transition-all">
                      <Search size={24} /> Ask Google Lens
                    </button>
                    <button onClick={triggerSprayer} disabled={spraying} className="bg-slate-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50">
                      <Zap size={24} className={spraying ? 'animate-pulse text-yellow-400' : ''} />
                      {spraying ? 'Activating Hardware...' : 'Trigger IoT Sprayer'}
                    </button>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    Note: Trigger the sprayer only after Google confirms a disease.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </section>
  );
};
