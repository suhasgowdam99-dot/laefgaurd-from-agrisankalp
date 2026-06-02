import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { Analyzer } from './components/Analyzer';
import { SensorDashboard } from './components/SensorDashboard';
import { HowItWorks } from './components/HowItWorks';

const MOCK_SENSOR_DATA = {
  current: { temp: 24.5, humidity: 62.8 },
  history: Array.from({ length: 12 }, (_, i) => ({
    time: `${i}:00`,
    temp: 22 + Math.random() * 5,
    humidity: 60 + Math.random() * 10
  }))
};

function App() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-green-100 selection:text-green-900 overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <section className="py-24 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Environmental Telemetry</h2>
               <p className="text-slate-500 font-medium mt-2">Real-time data from your IoT sensor network</p>
            </div>
            <SensorDashboard data={MOCK_SENSOR_DATA} />
          </div>
        </section>
        <HowItWorks />
        <Analyzer />
      </main>

      <footer className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
            <div className="max-w-xs space-y-6">
               <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18l7 3.89v8.25l-7 3.89-7-3.89V8.07l7-3.89z"/></svg>
                </div>
                <span className="text-xl font-bold tracking-tight">LeafGuard</span>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed">
                Empowering the future of agriculture with precision computer vision and autonomous monitoring.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
               <div className="space-y-4">
                  <h5 className="font-bold text-slate-100 uppercase tracking-widest text-[10px]">Platform</h5>
                  <ul className="space-y-3 text-slate-400 font-bold text-sm">
                    <li><button onClick={() => document.getElementById('detect')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-green-500 transition-colors">Analyzer</button></li>
                    <li><button onClick={() => document.getElementById('how')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-green-500 transition-colors">Our Process</button></li>
                  </ul>
               </div>
               <div className="space-y-4">
                  <h5 className="font-bold text-slate-100 uppercase tracking-widest text-[10px]">Company</h5>
                  <ul className="space-y-3 text-slate-400 font-bold text-sm">
                    <li><a href="#" className="hover:text-green-500 transition-colors">Agrisankalp</a></li>
                    <li><a href="#" className="hover:text-green-500 transition-colors">Team</a></li>
                    <li><a href="#" className="hover:text-green-500 transition-colors">Contact</a></li>
                  </ul>
               </div>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm font-bold text-slate-500">
              © 2024 LeafGuard From Agrisankalp. Built by team Agrisankalp.
            </p>
            <div className="flex gap-10">
              <a href="#" className="text-xs font-bold text-slate-500 hover:text-green-500 uppercase tracking-widest">Privacy Policy</a>
              <a href="#" className="text-xs font-bold text-slate-500 hover:text-green-500 uppercase tracking-widest">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
