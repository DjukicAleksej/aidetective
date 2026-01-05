
import React from 'react';
import { Theory } from '../types';

interface TheoriesViewProps {
  theories: Theory[];
}

const TheoriesView: React.FC<TheoriesViewProps> = ({ theories }) => {
  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-4xl font-serif text-white">Hypotheses</h2>
        <span className="text-xs text-white/30 uppercase tracking-widest">Connecting the Dots</span>
      </div>

      <div className="space-y-8">
        {theories.map((theory) => (
          <div key={theory.id} className="p-10 border border-white/5 bg-gradient-to-br from-[#0c0c0c] to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-[#d4af37]" />
            
            <h3 className="text-3xl font-serif text-white mb-6">{theory.title}</h3>
            
            <p className="text-white/70 leading-relaxed mb-10 text-lg">
              {theory.content}
            </p>

            <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-[#d4af37] mb-3">Linked Suspects</h4>
                <div className="flex gap-2">
                  {theory.linkedSuspects.map(s => (
                    <span key={s} className="px-3 py-1 bg-white/5 border border-white/10 text-xs text-white/60">
                      {s === 's1' ? 'Julian Sterling' : s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-[#d4af37] mb-3">Linked Evidence</h4>
                <div className="flex gap-2">
                  {theory.linkedClues.map(c => (
                    <span key={c} className="px-3 py-1 bg-white/5 border border-white/10 text-xs text-white/60">
                      {c === 'c1' ? 'Cyanide Vial' : 'Burnt Letter'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button className="w-full py-12 border border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 transition-all text-white/20 hover:text-white/60 uppercase tracking-[0.3em] text-xs">
          Draft New Theory
        </button>
      </div>
    </div>
  );
};

export default TheoriesView;
