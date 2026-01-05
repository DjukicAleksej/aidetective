
import React from 'react';
import { InvestigationCase } from '../types';

interface DashboardProps {
  cases: InvestigationCase[];
  onSelectCase: (c: InvestigationCase) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ cases, onSelectCase }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-white/10 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-sm uppercase tracking-[0.3em] text-[#d4af37] font-medium mb-2">Thorne & Co.</h1>
            <h2 className="text-5xl font-serif font-semibold text-white">Investigation Suite</h2>
          </div>
          <button className="px-6 py-2 bg-white text-black font-medium hover:bg-[#d4af37] hover:text-white transition-colors">
            New Case
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.map((c) => (
            <div 
              key={c.id}
              onClick={() => onSelectCase(c)}
              className="group cursor-pointer border border-white/10 p-6 hover:border-[#d4af37]/50 transition-all bg-gradient-to-b from-white/5 to-transparent"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border ${c.status === 'Open' ? 'border-red-500/50 text-red-400' : 'border-green-500/50 text-green-400'}`}>
                  {c.status}
                </span>
                <span className="text-[10px] text-white/30 font-mono">ID: {c.id}</span>
              </div>
              <h3 className="text-2xl font-serif mb-3 group-hover:text-[#d4af37] transition-colors">{c.title}</h3>
              <p className="text-sm text-white/50 line-clamp-3 leading-relaxed mb-6">
                {c.description}
              </p>
              <div className="flex items-center text-xs font-medium uppercase tracking-widest text-[#d4af37]">
                Begin Investigation
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
