import { Zap, Shield, BarChart3, Users, Globe, Cpu } from 'lucide-react';

const features = [
  {
    title: 'Lightning Fast',
    description: 'Optimized performance that scales with your growth without breaking a sweat.',
    icon: Zap,
    color: 'bg-amber-500'
  },
  {
    title: 'Enterprise Security',
    description: 'End-to-end encryption and compliance standards that keep your data safe.',
    icon: Shield,
    color: 'bg-emerald-500'
  },
  {
    title: 'Advanced Analytics',
    description: 'Real-time insights and custom dashboards to track every key metric.',
    icon: BarChart3,
    color: 'bg-indigo-500'
  },
  {
    title: 'Team Collaboration',
    description: 'Built-in tools for seamless communication across departments.',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    title: 'Global Scale',
    description: 'Deploy anywhere with our distributed infrastructure network.',
    icon: Globe,
    color: 'bg-purple-500'
  },
  {
    title: 'AI Powered',
    description: 'Smart automation that learns from your team to optimize workflows.',
    icon: Cpu,
    color: 'bg-rose-500'
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything you need to succeed</h2>
          <p className="text-slate-600 text-lg">
            Our platform provides all the tools your business needs to scale effectively in the modern digital landscape.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="p-8 rounded-3xl border border-slate-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className={`${feature.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-${feature.color.split('-')[1]}-100`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
