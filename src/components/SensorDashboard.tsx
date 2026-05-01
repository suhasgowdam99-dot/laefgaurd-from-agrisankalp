import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Thermometer, Droplets, Activity } from 'lucide-react';

export const SensorDashboard = ({ data }: { data: any }) => {
  return (
    <div className="space-y-8">
      {/* AI Interpretation Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-emerald-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
            <Activity size={14} />
            Neural Interpretation Live
          </div>
          <h2 className="text-3xl font-bold">Crop Health Index: <span className="text-emerald-300">Optimum (94%)</span></h2>
          <p className="text-emerald-50/80 leading-relaxed font-medium">
            Based on the current temperature of {data.current.temp}°C and soil humidity of {data.current.humidity}%, 
            the AI predicts a low pathogen risk for the next 48 hours. Transpiration rates are steady.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center min-w-[140px]">
            <p className="text-[10px] font-bold text-emerald-200 uppercase mb-1">Growth Velocity</p>
            <p className="text-2xl font-bold">+2.4%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center min-w-[140px]">
            <p className="text-[10px] font-bold text-emerald-200 uppercase mb-1">Stress Level</p>
            <p className="text-2xl font-bold">Minimal</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Temp Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
              <Thermometer size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Air Temperature</p>
              <h3 className="text-3xl font-bold text-slate-900">{data.current.temp.toFixed(1)}°C</h3>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.history}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip />
                <Area type="monotone" dataKey="temp" stroke="#f97316" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Humidity Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
              <Droplets size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Soil Humidity</p>
              <h3 className="text-3xl font-bold text-slate-900">{data.current.humidity.toFixed(1)}%</h3>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.history}>
                <defs>
                  <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip />
                <Area type="monotone" dataKey="humidity" stroke="#2563eb" fillOpacity={1} fill="url(#colorHum)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
