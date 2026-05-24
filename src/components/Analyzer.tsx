import React, { useState, useRef } from 'react';
import { Camera, X, Search, Zap, Loader2, Leaf, Microscope } from 'lucide-react';
import { runCustomInference, DetectionResult } from '../services/localAi';

export const Analyzer = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [result, setResult] = useState<DetectionResult | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setIsCameraActive(true);
    setImage(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied.");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0);
      setImage(canvasRef.current.toDataURL('image/jpeg'));
      if (videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      setIsCameraActive(false);
    }
  };

  const handleAnalysis = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const data = await runCustomInference(image, (m) => setStatusMsg(m));
      setResult(data);
      if (data.status === 'disease') {
        fetch('/api/iot?action=spray&status=1').catch(() => {});
      }
    } catch (e) {
      alert("Error: Custom model files missing in /public/model/");
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  return (
    <section id="detect" className="py-24 bg-slate-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
             <Leaf size={14} />
             20-Class Neural Hub
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Precision Diagnostics</h2>
          <p className="text-slate-500 font-medium">Powered by your custom-trained agritech model</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-2xl">
          {!result ? (
            <div className="space-y-10">
              <div className="relative aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-inner group">
                {isCameraActive ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <button onClick={capturePhoto} className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-green-600 shadow-xl active:scale-90 transition-transform" />
                    <button onClick={() => setIsCameraActive(false)} className="absolute top-6 right-6 p-2 bg-black/40 text-white rounded-full"><X size={20}/></button>
                  </>
                ) : image ? (
                  <>
                    <img src={image} className="w-full h-full object-cover" />
                    <button onClick={() => setImage(null)} className="absolute top-6 right-6 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={20}/></button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-6">
                    <Microscope size={48} className="text-slate-700" />
                    <div className="flex gap-4">
                      <button onClick={startCamera} className="bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-xl hover:bg-green-700 transition-all">Start Camera</button>
                      <label className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold shadow-xl cursor-pointer hover:bg-slate-50 transition-all border border-slate-100">
                        Upload Sample
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
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
                  <button onClick={handleAnalysis} className="bg-green-600 text-white px-12 py-5 rounded-2xl font-bold flex items-center gap-3 shadow-2xl hover:bg-green-700 transition-all active:scale-95 text-lg">
                    <Search size={24} /> Initialize Neural Scan
                  </button>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                  <p className="font-bold text-green-700 animate-pulse uppercase tracking-[0.2em] text-[10px]">{statusMsg || 'Scanning...'}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500">
               <div className="flex flex-col md:flex-row gap-12 items-start">
                  <div className="w-full md:w-2/5 aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-50">
                    <img src={image || ''} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-8 py-4">
                    <div>
                      <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-2">Custom Analysis Successful</p>
                      <h3 className="text-4xl font-black text-slate-900 mb-1">{result.name}</h3>
                      <p className="text-lg font-bold text-green-600 italic">{result.confidence} Probability Score</p>
                    </div>
                    
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative">
                      <div className="absolute -top-3 left-8 bg-white border border-slate-100 px-4 py-1 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">
                         Botanical Advice
                      </div>
                      <p className="text-slate-600 leading-relaxed text-lg font-medium">
                        "{result.advice}"
                      </p>
                    </div>

                    <div className="flex gap-4">
                       <button onClick={() => { setResult(null); setImage(null); }} className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95">New Scan</button>
                       <button className="px-8 bg-white border-2 border-slate-100 text-slate-400 py-5 rounded-2xl font-bold hover:bg-slate-50 transition-all">Save Report</button>
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
