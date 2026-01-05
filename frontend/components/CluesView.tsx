
import React from 'react';
import { Clue } from '../types';

interface CluesViewProps {
  clues: Clue[];
}

const CluesView: React.FC<CluesViewProps> = ({ clues }) => {
  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-4xl font-serif text-white">Evidence Locker</h2>
        <span className="text-xs text-white/30 uppercase tracking-widest">Tangible Remains</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clues.map((clue) => (
          <div 
            key={clue.id}
            className="group relative p-8 bg-[#0a0a0a] border border-white/5 hover:border-[#d4af37]/30 transition-all flex flex-col justify-between overflow-hidden"
          >
            {/* Background Texture/Accent */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-3xl group-hover:bg-[#d4af37]/10 transition-colors" />
            
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border ${
                  clue.confidence === 'Confirmed' ? 'border-green-500/50 text-green-400' : 'border-yellow-500/50 text-yellow-400'
                }`}>
                  {clue.confidence}
                </span>
                <span className="text-[10px] text-white/30 font-mono">{clue.source}</span>
              </div>
              
              <h3 className="text-2xl font-serif text-white mb-3 group-hover:text-[#d4af37] transition-colors">{clue.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed italic mb-8">
                {clue.description}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-4">
               <button className="text-[10px] uppercase tracking-widest text-[#d4af37] hover:underline">Link to Suspect</button>
               <button className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white">Request Forensics</button>
            </div>
          </div>
        ))}

        {/* Placeholder for new discovery */}
        <div className="border border-dashed border-white/10 p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-white/5 transition-colors">
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-4 text-white/20 group-hover:text-white group-hover:border-white transition-all">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
          <span className="text-xs uppercase tracking-widest text-white/30">Catalog New Item</span>
        </div>
      </div>
    </div>
  );
};

export default CluesView;
