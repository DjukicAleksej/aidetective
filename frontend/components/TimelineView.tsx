
import React from 'react';
import { TimelineEvent } from '../types';

interface TimelineViewProps {
  timeline: TimelineEvent[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ timeline }) => {
  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-12">
        <h2 className="text-4xl font-serif text-white">Event Timeline</h2>
        <span className="text-xs text-white/30 uppercase tracking-widest">Reconstructing the Night</span>
      </div>

      <div className="relative pl-8 border-l border-white/10 space-y-12 py-4">
        {timeline.map((event, idx) => (
          <div key={event.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[37px] top-1.5 w-4 h-4 bg-[#0a0a0a] border-2 border-[#d4af37] rounded-full group-hover:scale-125 transition-transform" />
            
            <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-12">
              <div className="min-w-[100px]">
                <span className="text-xl font-mono text-[#d4af37] font-medium">{event.time}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg text-white font-medium">{event.description}</h3>
                  {event.isGap && (
                    <span className="px-2 py-0.5 border border-yellow-500/30 text-yellow-500/70 text-[8px] uppercase tracking-widest rounded-full">Logical Gap</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {event.involvedSuspects.map(sid => (
                    <div key={sid} className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest text-white/40">
                      Ref: {sid}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gap indicator between events */}
            {idx < timeline.length - 1 && event.isGap && (
                <div className="absolute -left-[30px] top-full h-12 flex items-center">
                    <div className="h-full border-l-2 border-dotted border-yellow-500/20" />
                </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 border border-white/5 bg-white/[0.02] rounded-sm">
        <h4 className="text-xs uppercase tracking-[0.2em] text-[#d4af37] mb-4">Analytical Summary</h4>
        <p className="text-sm text-white/50 leading-relaxed italic">
          "The events between 9:30 PM and 11:00 PM remain clouded in uncertainty. We have a locked door, a missing son, and a housekeeper who hears voices but sees no faces. The sequence is logical, yet the pieces do not quite fit the frame of a natural tragedy."
        </p>
      </div>
    </div>
  );
};

export default TimelineView;
