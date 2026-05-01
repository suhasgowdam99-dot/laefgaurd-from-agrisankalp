import { motion } from 'framer-motion';

export const Stats = () => {
  const stats = [
    { value: '70–80%', label: 'LESS CHEMICAL WASTE', color: 'text-green-600' },
    { value: '24/7', label: 'LIVE MONITORING', color: 'text-green-600' },
    { value: '6', label: 'HARDWARE COMPONENTS', color: 'text-green-600' },
  ];

  return (
    <section className="bg-white py-24 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
          {stats.map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="text-center group"
            >
              <p className={`text-5xl lg:text-7xl font-black ${stat.color} tracking-tighter mb-4 group-hover:scale-105 transition-transform duration-500`}>
                {stat.value}
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-6 bg-slate-200" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">
                  {stat.label}
                </p>
                <div className="h-px w-6 bg-slate-200" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
