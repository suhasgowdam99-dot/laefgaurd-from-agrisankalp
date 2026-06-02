import React from 'react';
import { motion } from 'framer-motion';
import { CloudRain, ScanLine, Target } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      title: 'Supabase Data',
      desc: 'Real-time botanical database provides detailed descriptions and treatment protocols for 4 costly plants.',
      icon: CloudRain,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'AI Analysis',
      desc: 'Our advanced neural network processes high-resolution imagery to pinpoint disease and pathogens.',
      icon: ScanLine,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Precision Action',
      desc: 'Hardware actuators deploy targeted pesticides only where needed, reducing chemical waste by 80%.',
      icon: Target,
      color: 'bg-emerald-50 text-emerald-600'
    }
  ];

  return (
    <section id="how" className="py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">How it works</h2>
          <div className="w-24 h-1.5 bg-green-600 rounded-full mx-auto" />
        </div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-20 relative">
          {/* Connector Line (Desktop Only) */}
          <div className="hidden md:block absolute top-1/4 left-0 w-full h-px bg-slate-100 -z-10" />
          
          {steps.map((step, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              key={i} 
              className="relative p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-8 shadow-inner`}>
                <step.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {step.desc}
              </p>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center font-black text-2xl border-4 border-white">
                0{i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
