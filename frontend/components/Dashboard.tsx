import React from 'react';
import { InvestigationCase } from '../types';

interface DashboardProps {
  cases: InvestigationCase[];
  onSelectCase: (c: InvestigationCase) => void;
  onNewCase: () => void;
  onDeleteCase?: (caseId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ cases, onSelectCase, onNewCase, onDeleteCase }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] p-8 md:p-16">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <header className="mb-16 border-b border-white/10 pb-10 flex justify-between items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#d4af37]/30 shadow-lg shadow-[#d4af37]/10">
                <img src="/logo.png" alt="Benoit Blanc Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-xs uppercase tracking-[0.4em] text-[#d4af37]/80 font-medium">Benoit Blanc</h1>
                <h2 className="text-4xl md:text-5xl font-serif font-semibold text-white mt-1">Investigation Suite</h2>
              </div>
            </div>
            <p className="text-sm text-white/40 italic font-serif max-w-2xl">
              "The truth is like a donut, my friend. It has a hole in the center, and only when we fill that hole with logic can we see the whole shape."
            </p>
          </div>
          <button
            onClick={onNewCase}
            className="px-6 py-3 bg-gradient-to-r from-white to-white/90 text-black font-semibold hover:from-[#d4af37] hover:to-[#d4af37]/90 hover:text-white transition-all shadow-lg hover:shadow-[#d4af37]/20 rounded-sm uppercase tracking-wider text-xs"
          >
            New Case
          </button>
        </header>

        {/* Cases Grid - Modern Cards */}
        {cases.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-white/10 rounded-lg">
            <p className="text-white/40 font-serif text-lg mb-2">No active cases</p>
            <p className="text-white/20 text-sm">Create a new case to begin your investigation</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCase(c)}
                className="group cursor-pointer relative overflow-hidden border border-white/10 p-6 hover:border-[#d4af37]/50 transition-all duration-300 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-sm hover:shadow-2xl hover:shadow-[#d4af37]/10"
              >
                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Delete Button */}
                {onDeleteCase && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete case "${c.title}"? This action cannot be undone.`)) {
                        onDeleteCase(c.id);
                      }
                    }}
                    className="absolute top-4 right-4 z-20 p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Case"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] uppercase tracking-widest px-3 py-1 border backdrop-blur-sm ${c.status === 'Open'
                      ? 'border-red-500/50 text-red-400 bg-red-500/10'
                      : 'border-green-500/50 text-green-400 bg-green-500/10'
                      }`}>
                      {c.status}
                    </span>
                    <span className="text-[10px] text-white/20 font-mono">#{c.id.split('-')[1]}</span>
                  </div>

                  <h3 className="text-2xl font-serif mb-3 group-hover:text-[#d4af37] transition-colors duration-300 text-white font-semibold">
                    {c.title}
                  </h3>

                  <p className="text-sm text-white/50 line-clamp-3 leading-relaxed mb-6 font-light">
                    {c.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-6 text-xs text-white/30">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {c.parties.length} parties
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {c.statements.length} statements
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center text-xs font-semibold uppercase tracking-widest text-[#d4af37] group-hover:gap-3 transition-all">
                    Begin Investigation
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
