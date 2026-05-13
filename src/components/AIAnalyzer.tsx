import React, { useState } from 'react';
import { Upload, Search, CheckCircle2, AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AIAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDiagnose = async () => {
    setAnalyzing(true);
    setResult(null);
    
    // Simulate API call to backend
    try {
      const response = await fetch('http://localhost:5000/api/ai/diagnose', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        }
      });
      const data = await response.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden relative">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="w-full md:w-1/2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
            <h2 className="text-3xl font-extrabold text-slate-900">Neural Diagnostics</h2>
          </div>
          <p className="text-slate-500 mb-8 font-medium">Identify complex pathogens and nutritional deficiencies using our multi-spectral neural network.</p>

          <div className="relative group cursor-pointer border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <p className="font-bold text-slate-900">{file.name}</p>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-2 text-sm text-rose-500 font-bold hover:underline">Remove</button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                  <Upload size={32} />
                </div>
                <p className="font-bold text-slate-900 uppercase tracking-wider text-sm mb-1">Upload Leaf Photo</p>
                <p className="text-xs text-slate-400 font-medium">Supports JPG, PNG up to 10MB</p>
              </div>
            )}
          </div>

          <button
            disabled={!file || analyzing}
            onClick={handleDiagnose}
            className="w-full mt-6 bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {analyzing ? <Loader2 className="animate-spin" /> : <Search size={20} />}
            {analyzing ? 'Neural Processing...' : 'Run Diagnostics'}
          </button>
        </div>

        <div className="w-full md:w-1/2 h-full min-h-[400px] flex items-center justify-center bg-slate-50 rounded-3xl border border-slate-100 p-8 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!result && !analyzing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <ShieldAlert size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-medium">Results will appear here</p>
              </motion.div>
            )}

            {analyzing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col items-center">
                 <div className="w-48 h-48 bg-emerald-100 rounded-3xl mb-6 relative overflow-hidden flex items-center justify-center">
                   <div className="absolute top-0 w-full h-1 bg-emerald-500 animate-[scan_2s_infinite]" />
                   <Search size={48} className="text-emerald-600 animate-pulse" />
                 </div>
                 <p className="text-emerald-600 font-bold animate-pulse">Scanning Pathogens...</p>
              </motion.div>
            )}

            {result && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6 w-full">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${result.severity === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">{result.name}</h4>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{(result.confidence * 100).toFixed(1)}% Accuracy</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    Treatment Advice
                  </h5>
                  <p className="text-slate-600 leading-relaxed text-sm">{result.advice}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0% }
          50% { top: 100% }
          100% { top: 0% }
        }
      `}</style>
    </div>
  );
};
