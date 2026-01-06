

import React, { useState } from 'react';
import { Clue, Suspect } from '../types';

interface CluesViewProps {
  clues: Clue[];
  suspects: Suspect[];
  onAddClue?: (clue: Partial<Clue>) => void;
  onUpdateClue?: (clue: Clue) => void;
  onDeleteClue?: (id: string) => void;
}

const CluesView: React.FC<CluesViewProps> = ({ clues, suspects, onAddClue, onUpdateClue, onDeleteClue }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newClue, setNewClue] = useState<Partial<Clue>>({ title: '', description: '', source: '', confidence: 'Questionable' });
  const [editForm, setEditForm] = useState<Partial<Clue>>({});
  const [filter, setFilter] = useState<'All' | 'Confirmed' | 'Questionable' | 'Disputed'>('All');

  const filteredClues = clues.filter(c => filter === 'All' || c.confidence === filter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddClue && newClue.title) {
      onAddClue(newClue);
      setNewClue({ title: '', description: '', source: '', confidence: 'Questionable' });
      setIsAdding(false);
    }
  };

  const handleUpdate = (e: React.FormEvent, original: Clue) => {
    e.preventDefault();
    if (onUpdateClue) {
      onUpdateClue({ ...original, ...editForm } as Clue);
      setEditingId(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-serif text-white">Evidence Locker</h2>
          <span className="text-xs text-white/30 uppercase tracking-widest">{filteredClues.length} Items Cataloged</span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 border border-[#d4af37] text-[#d4af37] text-xs uppercase tracking-widest hover:bg-[#d4af37] hover:text-[#0a0a0a] transition-all"
        >
          {isAdding ? 'Cancel' : '+ Add Evidence'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-8 border-b border-white/5 pb-4">
        {['All', 'Confirmed', 'Questionable', 'Disputed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`text-[10px] uppercase tracking-[0.2em] transition-all ${filter === f ? 'text-[#d4af37] border-b border-[#d4af37] pb-1' : 'text-white/30 hover:text-white/60'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-12 p-6 border border-white/10 bg-white/5 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] uppercase text-white/40 mb-1">Item Name</label>
              <input
                className="w-full bg-[#0a0a0a] border border-white/10 text-white p-2 text-sm focus:border-[#d4af37] outline-none"
                value={newClue.title}
                onChange={e => setNewClue({ ...newClue, title: e.target.value })}
                placeholder="e.g. Bloody Knife"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-white/40 mb-1">Description</label>
              <textarea
                className="w-full bg-[#0a0a0a] border border-white/10 text-white p-2 text-sm focus:border-[#d4af37] outline-none h-20"
                value={newClue.description}
                onChange={e => setNewClue({ ...newClue, description: e.target.value })}
                placeholder="Details about the item..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-white/40 mb-1">Source/Location</label>
                <input
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white p-2 text-sm focus:border-[#d4af37] outline-none"
                  value={newClue.source}
                  onChange={e => setNewClue({ ...newClue, source: e.target.value })}
                  placeholder="Found in..."
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-white/40 mb-1">Confidence</label>
                <select
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white p-2 text-sm focus:border-[#d4af37] outline-none"
                  value={newClue.confidence}
                  onChange={e => setNewClue({ ...newClue, confidence: e.target.value as any })}
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Questionable">Questionable</option>
                  <option value="Disputed">Disputed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase text-white/40 mb-2">Linked Suspects</label>
              <div className="flex flex-wrap gap-2">
                {suspects.map(s => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => {
                      const current = newClue.linkedSuspects || [];
                      const updated = current.includes(s.id)
                        ? current.filter(id => id !== s.id)
                        : [...current, s.id];
                      setNewClue({ ...newClue, linkedSuspects: updated });
                    }}
                    className={`px-3 py-1 text-xs border transition-colors ${(newClue.linkedSuspects || []).includes(s.id)
                      ? 'bg-[#d4af37] text-black border-[#d4af37]'
                      : 'bg-transparent border-white/10 text-white/40 hover:border-white/40'
                      }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2 bg-[#d4af37] text-black text-xs uppercase font-bold tracking-widest">
              Catalog Item
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredClues.map((clue) => {
          const isEditingItem = editingId === clue.id;
          return (
            <div
              key={clue.id}
              className="group relative p-8 bg-[#0a0a0a] border border-white/5 hover:border-[#d4af37]/30 transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Background Texture/Accent */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-3xl group-hover:bg-[#d4af37]/10 transition-colors" />

              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditingId(clue.id); setEditForm(clue); }}
                  className="p-1 hover:text-[#d4af37] text-white/40"
                >
                  <span className="text-xs uppercase">Edit</span>
                </button>
                {onDeleteClue && (
                  <button
                    onClick={() => onDeleteClue(clue.id)}
                    className="p-1 hover:text-red-500 text-white/40"
                  >
                    <span className="text-xs uppercase">Delete</span>
                  </button>
                )}
              </div>

              {isEditingItem ? (
                <form onSubmit={(e) => handleUpdate(e, clue)} className="space-y-3 relative z-10">
                  <input className="w-full bg-white/5 border border-white/10 p-2 text-white" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                  <textarea className="w-full bg-white/5 border border-white/10 p-2 text-white text-xs h-20" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />

                  {/* Edit Linked Suspects */}
                  <div>
                    <label className="block text-[10px] uppercase text-white/40 mb-2">Linked Suspects</label>
                    <div className="flex flex-wrap gap-2">
                      {suspects.map(s => (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => {
                            const current = editForm.linkedSuspects || [];
                            const updated = current.includes(s.id)
                              ? current.filter(id => id !== s.id)
                              : [...current, s.id];
                            setEditForm({ ...editForm, linkedSuspects: updated });
                          }}
                          className={`px-3 py-1 text-xs border transition-colors ${(editForm.linkedSuspects || []).includes(s.id)
                            ? 'bg-[#d4af37] text-black border-[#d4af37]'
                            : 'bg-transparent border-white/10 text-white/40 hover:border-white/40'
                            }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button type="button" onClick={() => setEditingId(null)} className="text-xs text-white/40 hover:text-white">Cancel</button>
                    <button type="submit" className="text-xs text-[#d4af37] border border-[#d4af37] px-3 py-1">Save</button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border ${clue.confidence === 'Confirmed' ? 'border-green-500/50 text-green-400' : 'border-yellow-500/50 text-yellow-400'
                      }`}>
                      {clue.confidence}
                    </span>
                    <span className="text-[10px] text-white/30 font-mono pr-12">{clue.source}</span>
                  </div>

                  <h3 className="text-2xl font-serif text-white mb-3 group-hover:text-[#d4af37] transition-colors">{clue.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed italic mb-4">
                    {clue.description}
                  </p>

                  {/* Display Linked Suspects */}
                  {clue.linkedSuspects && clue.linkedSuspects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {clue.linkedSuspects.map(sid => {
                        const suspect = suspects.find(s => s.id === sid);
                        return suspect ? (
                          <span key={sid} className="text-[10px] uppercase border border-white/10 px-2 py-0.5 text-white/40">
                            Link: {suspect.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              )}

              {!isEditingItem && (
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <button onClick={() => { setEditingId(clue.id); setEditForm(clue); }} className="text-[10px] uppercase tracking-widest text-[#d4af37] hover:underline">Link to Suspect</button>
                  <button className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white">Request Forensics</button>
                </div>
              )}
            </div>
          )
        })}

        {/* Placeholder for new discovery */}
        <div
          onClick={() => setIsAdding(true)}
          className="border border-dashed border-white/10 p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-white/5 transition-colors"
        >
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
