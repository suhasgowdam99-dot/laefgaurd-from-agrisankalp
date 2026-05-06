import React, { useState } from 'react';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

export const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('http://localhost:5000/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-emerald-50 border border-emerald-100 p-12 rounded-3xl text-center max-w-xl mx-auto my-20 animate-in zoom-in-95 duration-500">
        <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={48} />
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Received!</h3>
        <p className="text-slate-600 mb-6">Thank you for reaching out. Our team will contact you within 24 hours.</p>
        <button 
          onClick={() => setStatus('idle')}
          className="text-indigo-600 font-semibold hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <section id="contact" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-5/12 bg-indigo-600 p-12 text-white">
            <h2 className="text-3xl font-bold mb-6">Let's build something great.</h2>
            <p className="text-indigo-100 mb-8 leading-relaxed">
              Have questions about how NexusSaaS can transform your workflow? Send us a message and we'll get back to you shortly.
            </p>
            
            <div className="space-y-6">
              {[
                { label: 'Email', value: 'hello@nexussaas.com' },
                { label: 'Sales', value: '+1 (555) 000-0000' },
                { label: 'Support', value: '24/7 Priority Support' }
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-sm text-indigo-200 font-medium uppercase tracking-wider">{item.label}</p>
                  <p className="text-lg font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="md:w-7/12 p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Work Email</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@company.com"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help?"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <button
                disabled={status === 'loading'}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {status === 'loading' ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Send size={20} />
                    Send Message
                  </>
                )}
              </button>
              
              {status === 'error' && (
                <p className="text-red-500 text-sm font-medium text-center">Something went wrong. Please try again.</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
