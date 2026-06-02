import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Search, Zap, Loader2, Leaf, Microscope, ShieldCheck, AlertCircle } from 'lucide-react';
import { runCustomInference, DetectionResult } from '../services/localAi';

export const Analyzer = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [liveResult, setLiveResult] = useState<DetectionResult | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastDetectionRef = useRef<number>(0);

  const startCamera = async () => {
    setIsCameraActive(true);
    setLiveResult(null);
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
  };

  const detectFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;

    const now = Date.now();
    // Throttle detection to every 800ms to avoid freezing the UI
    if (now - lastDetectionRef.current > 800) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        
        const imageUri = canvasRef.current.toDataURL('image/jpeg', 0.8);
        
        try {
          const data = await runCustomInference(imageUri);
          if (data.status === 'disease' && parseFloat(data.confidence) > 70) {
            setLiveResult(data);
          } else if (parseFloat(data.confidence) < 30) {
            setLiveResult(null);
          }
        } catch (e) {
          console.error("Live detection error:", e);
        }
        lastDetectionRef.current = now;
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
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
             <Zap size={14} className="animate-pulse" />
             Live Neural Intelligence
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Real-Time Pathogen Scan</h2>
          <p className="text-slate-500 font-medium">Point your camera at a leaf for instant autonomous diagnosis</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[3rem] p-1 shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row h-full lg:h-[600px]">
            {/* Camera Viewport */}
            <div className="lg:w-3/5 bg-slate-900 relative group overflow-hidden">
              {isCameraActive ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover scale-x-[-1]" 
                  />
                  {/* Scanning Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/20 rounded-full" />
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-green-500/30 rounded-[2rem] animate-pulse" />
                     <div className="absolute top-0 w-full h-1 bg-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-[scan_3s_infinite]" />
                  </div>
                  <button 
                    onClick={stopCamera} 
                    className="absolute top-6 right-6 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all z-20"
                  >
                    <X size={24}/>
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] lg:h-full gap-8 bg-slate-950">
                   <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                     <Camera size={48} className="text-green-500" />
                   </div>
                   <div className="text-center space-y-2">
                     <p className="text-white font-bold text-xl uppercase tracking-widest">Ready for Scan</p>
                     <p className="text-slate-500 text-sm">Active environment tracking disabled</p>
                   </div>
                   <button 
                    onClick={startCamera} 
                    className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black shadow-2xl hover:bg-green-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                   >
                     Initialize Live Stream
                   </button>
                </div>
              )}
            </div>

            {/* Analysis Sidebar */}
            <div className="lg:w-2/5 p-10 bg-white flex flex-col justify-between">
               {!liveResult ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-700">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100">
                      <Search size={32} className="text-slate-300 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">Analyzing Feed...</h4>
                      <p className="text-slate-400 text-sm font-medium px-4">
                        Hold the leaf steady within the center of the frame for the neural engine to lock onto signatures.
                      </p>
                    </div>
                    {isCameraActive && (
                       <div className="flex gap-2">
                         {[1,2,3].map(i => (
                           <div key={i} className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}} />
                         ))}
                       </div>
                    )}
                 </div>
               ) : (
                 <div className="animate-in slide-in-from-right-10 duration-500 space-y-8">
                    <div className="flex items-start justify-between">
                       <div>
                         <div className="flex items-center gap-2 text-rose-600 mb-1">
                           <AlertCircle size={16} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Infection Detected</span>
                         </div>
                         <h3 className="text-3xl font-black text-slate-900 leading-none mb-2">{liveResult.name}</h3>
                         <div className="flex items-center gap-2">
                           <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-green-600" style={{width: liveResult.confidence}} />
                           </div>
                           <span className="text-xs font-bold text-green-600">{liveResult.confidence} Match</span>
                         </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Symptom Log</p>
                         <p className="text-slate-600 text-sm font-medium leading-relaxed">
                           {liveResult.description}
                         </p>
                      </div>

                      <div className="p-6 bg-green-50 rounded-[2rem] border border-green-100">
                         <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-3">Protocol</p>
                         <p className="text-green-800 text-sm font-bold leading-relaxed">
                           {liveResult.treatment}
                         </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                       <button className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold shadow-xl">Apply Treatment</button>
                       <button onClick={() => setLiveResult(null)} className="px-6 bg-slate-100 text-slate-600 py-4 rounded-xl font-bold">Ignore</button>
                    </div>
                 </div>
               )}

               <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Link</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-300 uppercase">
                    v3.2.0-stable
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(600px); opacity: 0; }
        }
      `}</style>
    </section>
  );
};
