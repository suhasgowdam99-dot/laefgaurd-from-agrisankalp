import React, { useState } from 'react';
import { Power, Zap, Wind, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const HardwareControl = () => {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSprayer = async () => {
    setLoading(true);
    const newStatus = active ? 0 : 1;
    
    try {
      const response = await fetch('http://localhost:5000/api/hardware/spray', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setActive(!active);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">ESP32 Sprayer Control</h3>
          <p className="text-slate-500 font-medium">Remote pesticide delivery system</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${active ? 'bg-emerald-100 text-emerald-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
          {active ? 'System Active' : 'System Standby'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={toggleSprayer}
          disabled={loading}
          className={`relative group h-64 rounded-3xl overflow-hidden transition-all duration-500 border-4 ${active ? 'border-emerald-500' : 'border-slate-100 hover:border-emerald-200'}`}
        >
          <div className={`absolute inset-0 transition-opacity duration-500 ${active ? 'bg-emerald-500' : 'bg-slate-50'}`} />
          <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
            {loading ? (
              <Loader2 className="animate-spin text-slate-400" size={48} />
            ) : (
              <>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${active ? 'bg-white text-emerald-500' : 'bg-white text-slate-300 shadow-lg'}`}>
                  <Power size={40} />
                </div>
                <h4 className={`text-xl font-bold mb-2 transition-colors ${active ? 'text-white' : 'text-slate-900'}`}>
                  {active ? 'Stop Spraying' : 'Activate Sprayer'}
                </h4>
                <p className={`text-sm font-medium transition-colors ${active ? 'text-emerald-100' : 'text-slate-400'}`}>
                  Click to override automatic control
                </p>
              </>
            )}
          </div>
        </button>

        <div className="space-y-4">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ESP32 Status</p>
              <p className="text-sm font-bold text-slate-900">Online - Low Latency</p>
            </div>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center">
              <Wind size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flow Rate</p>
              <p className="text-sm font-bold text-slate-900">{active ? '250ml / min' : '0ml / min'}</p>
            </div>
          </div>
          <div className="p-6 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200">
             <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider mb-2">Automated Advice</p>
             <p className="text-sm font-medium leading-relaxed">
               {active 
                ? "Spraying in progress. Ensure personnel have evacuated the greenhouse perimeter."
                : "Conditions optimal. Automated spraying scheduled for 04:00 AM based on humidity levels."}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
