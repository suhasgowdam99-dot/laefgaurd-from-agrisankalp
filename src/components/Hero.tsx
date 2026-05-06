import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Droplets, Microscope } from 'lucide-react';

export const Hero = () => {
  const scrollToDetect = () => {
    document.getElementById('detect')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-40 pb-20 overflow-hidden bg-white">
      {/* Background Soft Accents */}
      <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-green-50/50 to-transparent" />
      <div className="absolute top-40 left-10 -z-10 w-72 h-72 bg-green-100/20 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-1.5 rounded-full"
          >
            <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">
              Powered by AGRISANKALP and team
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.05]"
          >
            Protect your plants <br />
            with <span className="text-green-600 italic font-serif font-medium">precision AI</span> <br />
            detection
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 max-w-lg leading-relaxed font-medium"
          >
            LeafGuard combines computer vision and IoT sensing to catch disease early — and spray only where needed. Save your garden. Waste nothing.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <button 
              onClick={scrollToDetect}
              className="bg-green-600 text-white px-9 py-5 rounded-[1.25rem] font-bold shadow-2xl shadow-green-200 hover:bg-green-700 hover:-translate-y-1 transition-all flex items-center gap-3 group active:scale-95"
            >
              Analyse a Leaf
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-green-700 border-2 border-green-100 px-9 py-5 rounded-[1.25rem] font-bold hover:bg-green-50 transition-all active:scale-95 shadow-sm"
            >
              See how it works
            </button>
          </motion.div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative z-10 w-full max-w-[500px] aspect-square rounded-[3.5rem] bg-gradient-to-br from-green-100 to-white p-6 flex items-center justify-center border border-green-50 shadow-inner"
          >
            <img 
              src="https://images.unsplash.com/photo-1597362222323-85f101ab7582?auto=format&fit=crop&q=80&w=1000" 
              alt="Healthy Plant Leaf" 
              className="w-full h-full object-cover rounded-[3rem] shadow-2xl"
            />
          </motion.div>

          {/* Floating UI Cards - Strict Spec Replication */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 lg:-right-8 z-20 bg-white/80 backdrop-blur-2xl p-6 rounded-[2rem] shadow-2xl border border-white/50 min-w-[220px]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                <Droplets size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Humidity</p>
                <p className="text-2xl font-bold text-slate-900 leading-tight">68% <span className="text-xs text-green-500 font-bold ml-1">↑ High</span></p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-8 -left-4 lg:-left-12 z-20 bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-2xl border border-white/50 min-w-[280px]"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                <Microscope size={28} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Last detection</p>
                <div className="flex justify-between items-end mb-1.5">
                  <p className="text-base font-bold text-slate-900 leading-none">Powdery Mildew</p>
                  <p className="text-[10px] font-black text-orange-600 leading-none">87%</p>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '87%' }}
                    transition={{ duration: 1, delay: 1 }}
                    className="h-full bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]" 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
