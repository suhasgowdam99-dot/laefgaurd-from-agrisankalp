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

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image })
      });
      const data = await response.json();
      setResult(data);
    } catch (e) {
      alert("Error contacting Google Brain.");
    } finally {
      setLoading(false);
    }
  };

  const triggerSprayer = async () => {
    setSpraying(true);
    try {
      await fetch('/api/iot?action=spray&status=1');
      alert("Sprayer Activated!");
    } catch (e) {
      alert("IoT Connection Offline.");
    } finally {
      setTimeout(() => setSpraying(false), 3000);
    }
  };

  return (
    <section id="detect" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight italic">
            LeafGuard <span className="text-green-600">Intelligence</span>
          </h2>
          <p className="text-slate-500 font-medium">Direct connection to Google's Global Agricultural Knowledge Hub</p>
        </div>

        <div className="bg-green-50/50 border-2 border-dashed border-green-200 rounded-[3rem] p-12">
          {!result ? (
            <div className="space-y-10">
              <div className="relative max-w-2xl mx-auto aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white group">
                {isCameraActive ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <button onClick={capturePhoto} className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-green-600 shadow-xl active:scale-90 transition-transform" />
                    <button onClick={stopCamera} className="absolute top-6 right-6 p-2 bg-black/40 text-white rounded-full"><X size={20}/></button>
                  </>
                ) : image ? (
                  <>
                    <img src={image} className="w-full h-full object-cover" />
                    <button onClick={() => setImage(null)} className="absolute top-6 right-6 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={20}/></button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-white/50">
                    <Camera size={48} />
                    <div className="flex gap-4">
                      <button onClick={startCamera} className="bg-green-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-xl">Use Camera</button>
                      <label className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-sm shadow-xl cursor-pointer">
                        Upload File
                        <input type="file" className="hidden" onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setImage(ev.target?.result as string);
                            reader.readAsDataURL(f);
                          }
                        }} />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {image && !loading && (
                <div className="flex justify-center">
                  <button onClick={runAnalysis} className="bg-green-600 text-white px-12 py-5 rounded-2xl font-bold flex items-center gap-3 shadow-2xl hover:bg-green-700 transition-all active:scale-95 text-lg">
                    <Search size={24} /> Fetch Answer from Google Search Engine
                  </button>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                  <p className="font-bold text-green-700 animate-pulse uppercase tracking-[0.2em] text-xs">Fetching from Google Knowledge Hub...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
               <div className="flex flex-col md:flex-row gap-10 items-start bg-white p-10 rounded-[3rem] shadow-2xl border border-green-100">
                  <div className="w-full md:w-1/3 aspect-square rounded-[2rem] overflow-hidden shadow-inner bg-slate-50 border-4 border-slate-50">
                    <img src={image || ''} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Google Search Intelligence</p>
                        <div className="h-1 w-1 bg-green-400 rounded-full animate-ping" />
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Live Fetch: {new Date().toLocaleTimeString()}</span>
                      </div>
                      <h3 className="text-4xl font-black text-slate-900">{result.name}</h3>
                      <p className={`text-xs font-bold uppercase tracking-tighter ${result.status === 'disease' ? 'text-rose-500' : 'text-emerald-500'}`}>Status: {result.status}</p>
                    </div>
                    
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-600 leading-relaxed text-lg">
                      "{result.advice}"
                    </div>

                    <div className="flex gap-4">
                      {result.status === 'disease' && (
                        <button onClick={triggerSprayer} disabled={spraying} className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-xl">
                          <Zap size={20} className={spraying ? 'animate-pulse text-yellow-400' : ''} />
                          {spraying ? 'Triggering Sprayer...' : 'Start Silent Spray'}
                        </button>
                      )}
                      <button onClick={() => { setResult(null); setImage(null); }} className="flex-1 bg-white text-slate-400 py-4 rounded-xl font-bold border border-slate-100 hover:bg-slate-50 transition-all">New Scan</button>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </section>
  );
};
