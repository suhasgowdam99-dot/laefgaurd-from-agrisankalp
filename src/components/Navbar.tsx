import { Leaf } from 'lucide-react';

export const Navbar = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-green-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200">
            <Leaf size={24} fill="currentColor" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            LeafGuard <span className="text-green-600 font-medium text-lg">From Agrisankalp</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <button onClick={() => scrollTo('how')} className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-colors">How it works</button>
          <button onClick={() => scrollTo('detect')} className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-colors">Detect</button>
          <button 
            onClick={() => scrollTo('detect')}
            className="bg-green-600 text-white px-7 py-2.5 rounded-full text-sm font-bold shadow-xl shadow-green-100 hover:bg-green-700 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};
