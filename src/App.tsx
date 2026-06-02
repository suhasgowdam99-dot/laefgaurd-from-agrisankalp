import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { Analyzer } from './components/Analyzer';
import { SensorDashboard } from './components/SensorDashboard';
import { HowItWorks } from './components/HowItWorks';
import axios from 'axios';

const TS_CHANNEL_ID = '3132304';
const TS_READ_KEY = 'SIHPL0DF113P0NA2';

function App() {
  const [sensorData, setSensorData] = useState({
    current: { temp: 0, humidity: 0 },
    history: []
  });

  const fetchSensorData = async () => {
    try {
      const response = await axios.get(
        `https://api.thingspeak.com/channels/${TS_CHANNEL_ID}/feeds.json?api_key=${TS_READ_KEY}&results=20`
      );
      
      const feeds = response.data.feeds;
      if (feeds && feeds.length > 0) {
        const latest = feeds[feeds.length - 1];
        const history = feeds.map((f: any) => ({
          time: new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temp: parseFloat(f.field1) || 0,
          humidity: parseFloat(f.field2) || 0
        }));

        setSensorData({
          current: {
            temp: parseFloat(latest.field1) || 0,
            humidity: parseFloat(latest.field2) || 0
          },
          history: history as any
        });
      }
    } catch (error) {
      console.error("Error fetching ThingSpeak data:", error);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

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
            <SensorDashboard data={sensorData} />
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
