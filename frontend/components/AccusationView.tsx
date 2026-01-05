
import React, { useState } from 'react';
import { Suspect } from '../types';

interface AccusationViewProps {
  suspects: Suspect[];
}

const AccusationView: React.FC<AccusationViewProps> = ({ suspects }) => {
  const [target, setTarget] = useState<string>('');
  const [reasoning, setReasoning] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-1000">
        <h2 className="text-6xl font-serif text-[#d4af37] mb-6">Case Presented</h2>
        <p className="text-xl text-white/60 max-w-lg text-center leading-relaxed font-serif italic mb-12">
          "The truth is like a donut, my friend. It has a hole in the center, and only when we fill that hole with logic can we see the whole shape."
        </p>
        <div className="p-8 border border-white/10 bg-white/5 text-center">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Primary Target</p>
          <p className="text-2xl text-white font-serif">{suspects.find(s => s.id === target)?.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-serif text-white mb-4">The Moment of Truth</h2>
        <p className="text-white/40 uppercase tracking-[0.4em] text-xs">Final Verdict Required</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-12">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#d4af37] mb-4">Identify the Perpetrator</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suspects.map((s) => (
              <button
                key={s.id}
                onClick={() => setTarget(s.id)}
                className={`p-6 border transition-all text-left group ${
                  target === s.id ? 'border-[#d4af37] bg-white/10' : 'border-white/5 hover:border-white/20'
                }`}
              >
                <div className="text-[8px] uppercase tracking-widest text-white/30 mb-1">{s.role}</div>
                <div className={`text-lg font-serif ${target === s.id ? 'text-[#d4af37]' : 'text-white'}`}>{s.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#d4af37] mb-4">Definitive Reasoning</label>
          <textarea 
            className="w-full bg-[#0a0a0a] border border-white/10 p-6 text-white/80 focus:border-[#d4af37] transition-all outline-none h-48 resize-none font-serif text-lg leading-relaxed italic"
            placeholder="Lay out the inevitable logic of your conclusion..."
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
          />
        </div>

        <button 
          onClick={() => target && reasoning && setSubmitted(true)}
          disabled={!target || !reasoning}
          className={`w-full py-6 text-xs uppercase tracking-[0.5em] font-semibold transition-all ${
            target && reasoning ? 'bg-white text-black hover:bg-[#d4af37] hover:text-white' : 'bg-white/5 text-white/20 cursor-not-allowed'
          }`}
        >
          Present Case
        </button>
      </div>
    </div>
  );
};

export default AccusationView;
