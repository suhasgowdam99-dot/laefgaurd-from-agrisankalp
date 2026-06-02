import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Search, Zap, Loader2, Leaf, Microscope, AlertCircle, CheckCircle2 } from 'lucide-react';
import { runCustomInference, DetectionResult } from '../services/localAi';

export const Analyzer = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [result, setResult] = useState<DetectionResult | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastDetectionRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);

  const startCamera = async () => {
    setIsCameraActive(true);
    setImage(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 640, height: 480 } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsCameraActive(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    isProcessingRef.current = false;
  };

  const detectFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive || isProcessingRef.current) {
      if (isCameraActive) requestRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    const now = Date.now();
    // Throttle for Gemini
    if (now - lastDetectionRef.current > 3000) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        isProcessingRef.current = true;
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        
        const imageUri = canvasRef.current.toDataURL('image/jpeg', 0.6);
        
        try {
          const data = await runCustomInference(imageUri);
          setResult(data);
          setImage(imageUri);
        } catch (e) {
          console.error("Live detection error:", e);
        } finally {
          isProcessingRef.current = false;
          lastDetectionRef.current = now;
        }
      }
    }
    
    if (isCameraActive) {
      requestRef.current = requestAnimationFrame(detectFrame);
    }
  };

  useEffect(() => {
    if (isCameraActive) {
      detectFrame();
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isCameraActive]);

  return (
    <section id="detect" className="py-24 bg-slate-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
             <Leaf size={14} />
             Live Neural Hub
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Precision Diagnostics</h2>
          <p className="text-slate-500 font-medium">Powered by Gemini 3.5 Flash Intelligence</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-2xl">
          {!result ? (
            <div className="space-y-10">
              <div className="relative aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-inner group">
                {isCameraActive ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 pointer-events-none border-2 border-white/20 rounded-[2.5rem]" />
                    <button onClick={stopCamera} className="absolute top-6 right-6 p-2 bg-black/40 text-white rounded-full"><X size={20}/></button>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold text-white uppercase tracking-widest animate-pulse">
                       Scanning Live Feed...
                    </div>
                  </>
                ) : image ? (
                  <>
                    <img src={image} className="w-full h-full object-cover" />
                    <button onClick={() => { setImage(null); setResult(null); }} className="absolute top-6 right-6 p-2 bg-black/60 text-white rounded-full"><X size={20}/></button>
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
                            reader.onload = (ev) => {
                                const uri = ev.target?.result as string;
                                setImage(uri);
                                runCustomInference(uri).then(setResult);
                            };
                            reader.readAsDataURL(f);
                          }
                        }} />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500">
               <div className="flex flex-col md:flex-row gap-12 items-start">
                  <div className="w-full md:w-2/5 space-y-4">
                    <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-50">
                      <img src={image || ''} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-8 py-4">
                    <div>
                      <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-2">Neural Analysis Successful</p>
                      <h3 className="text-4xl font-black text-slate-900 mb-1">{result.name}</h3>
                      <p className="text-lg font-bold text-green-600 italic">{result.confidence} Probability Score</p>
                    </div>
                    
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative">
                      <div className="absolute -top-3 left-8 bg-white border border-slate-100 px-4 py-1 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">
                         Symptom Log
                      </div>
                      <p className="text-slate-600 leading-relaxed text-lg font-medium">
                        {result.description}
                      </p>
                    </div>

                    <div className="p-8 bg-green-50 rounded-[2.5rem] border border-green-100 relative">
                      <div className="absolute -top-3 left-8 bg-white border border-green-100 px-4 py-1 rounded-lg text-[9px] font-black text-green-600 uppercase tracking-widest">
                         Treatment Protocol
                      </div>
                      <p className="text-green-800 leading-relaxed text-lg font-bold">
                        {result.treatment}
                      </p>
                    </div>

                    <div className="flex gap-4">
                       <button onClick={() => { setResult(null); setImage(null); setIsCameraActive(true); }} className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95">New Scan</button>
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
