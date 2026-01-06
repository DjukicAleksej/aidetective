

import React, { useState } from 'react';
import { Suspect, Statement } from '../types';
import { dbService } from '../services/dbService';

interface PartiesViewProps {
  parties: Suspect[];
  statements: Statement[];
  onUpdateParty?: (party: Suspect) => void;
  onAddParty?: (party: Partial<Suspect>) => void;
  onDeleteParty?: (id: string) => void;
}

const PartiesView: React.FC<PartiesViewProps> = ({ parties, statements, onUpdateParty, onAddParty, onDeleteParty }) => {
  const [selectedParty, setSelectedParty] = useState<Suspect | null>(parties[0] || null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newParty, setNewParty] = useState<Partial<Suspect>>({ name: '', role: '', motive: '', alibi: '' });
  const [editForm, setEditForm] = useState<Partial<Suspect>>({});
  const [uploadingPartyId, setUploadingPartyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredParties = parties.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageUpload = async (partyId: string, file: File) => {
    try {
      setUploadingPartyId(partyId);
      await dbService.uploadSuspectImage(partyId, file);

      // Update the party's imageUrl to trigger re-render
      if (onUpdateParty) {
        const party = parties.find(s => s.id === partyId);
        if (party) {
          const updatedParty = {
            ...party,
            imageUrl: `https://acd4725c4ea3.ngrok-free.app/api/parties/${partyId}/image?t=${Date.now()}`
          };
          onUpdateParty(updatedParty);
          if (selectedParty?.id === partyId) {
            setSelectedParty(updatedParty);
          }
        }
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingPartyId(null);
    }
  };

  const handleSuspectClick = (party: Suspect, event: React.MouseEvent) => {
    if (!party.imageUrl) {
      event.preventDefault();
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          handleImageUpload(party.id, file);
        }
      };
      fileInput.click();
    } else {
      setSelectedParty(party);
      setIsEditing(false);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddParty && newParty.name && newParty.role) {
      onAddParty(newParty);
      setNewParty({ name: '', role: '', motive: '', alibi: '' });
      setIsAdding(false);
    } else {
      alert("Please fill in at least the Name and Role.");
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateParty && selectedParty && editForm.name) {
      onUpdateParty({ ...selectedParty, ...editForm } as Suspect);
      setIsEditing(false);
      // Update selected local state immediately for better UX
      setSelectedParty({ ...selectedParty, ...editForm } as Suspect);
    }
  };

  const getPlaceholderColor = (name: string) => {
    const colors = [
      'from-red-900/40 to-red-800/20',
      'from-blue-900/40 to-blue-800/20',
      'from-green-900/40 to-green-800/20',
      'from-yellow-900/40 to-yellow-800/20',
      'from-purple-900/40 to-purple-800/20',
      'from-pink-900/40 to-pink-800/20',
      'from-indigo-900/40 to-indigo-800/20',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-serif text-white">Party List</h2>
          <span className="text-xs text-white/30 uppercase tracking-widest">{filteredParties.length} Individuals of Interest</span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 border border-[#d4af37] text-[#d4af37] text-xs uppercase tracking-widest hover:bg-[#d4af37] hover:text-[#0a0a0a] transition-all"
        >
          {isAdding ? 'Cancel' : '+ Add New Party'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search parties by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 text-white p-3 pl-10 pr-20 text-sm focus:border-[#d4af37] outline-none transition-colors"
          />
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-widest text-[#d4af37] hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-12 p-6 border border-white/10 bg-white/5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase text-white/40 mb-1">Name</label>
              <input
                className="w-full bg-[#0a0a0a] border border-white/10 text-white p-2 text-sm focus:border-[#d4af37] outline-none"
                value={newParty.name}
                onChange={e => setNewParty({ ...newParty, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-white/40 mb-1">Role</label>
              <input
                className="w-full bg-[#0a0a0a] border border-white/10 text-white p-2 text-sm focus:border-[#d4af37] outline-none"
                value={newParty.role}
                onChange={e => setNewParty({ ...newParty, role: e.target.value })}
                placeholder="Gardener"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2 bg-[#d4af37] text-black text-xs uppercase font-bold tracking-widest">
              Create Profile
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredParties.map((s) => (
          <div
            key={s.id}
            onClick={(e) => handleSuspectClick(s, e)}
            className={`cursor-pointer transition-all border p-4 group overflow-hidden relative ${selectedParty?.id === s.id ? 'border-[#d4af37] bg-white/5' : 'border-white/5 hover:border-white/20'
              }`}
          >
            {/* Delete Button (Small x) */}
            {onDeleteParty && (
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteParty(s.id); if (selectedParty?.id === s.id) setSelectedParty(null); }}
                className="absolute top-2 right-2 text-white/20 hover:text-red-500 z-10"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}

            {/* Image Upload Button */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                id={`upload-${s.id}`}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(s.id, file);
                  }
                }}
              />
              <label
                htmlFor={`upload-${s.id}`}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-2 left-2 z-10 p-2 bg-black/60 hover:bg-[#d4af37]/80 text-white hover:text-black rounded-full cursor-pointer transition-all opacity-0 group-hover:opacity-100"
                title="Upload Image"
              >
                {uploadingPartyId === s.id ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </label>

              {s.imageUrl && s.imageUrl.startsWith('http') ? (
                <img src={s.imageUrl} alt={s.name} className="w-full aspect-[4/5] object-cover mb-4 grayscale group-hover:grayscale-0 transition-all duration-500" />
              ) : (
                <div className={`w-full aspect-square mb-4 bg-gradient-to-br ${getPlaceholderColor(s.name)} flex items-center justify-center border border-white/5`}>
                  <span className="text-4xl font-serif text-white/20 font-bold">{getInitials(s.name)}</span>
                </div>
              )}
            </div>

            <div className="text-xs uppercase tracking-widest text-[#d4af37] mb-1 truncate">{s.role}</div>
            <h3 className="text-xl font-serif text-white truncate">{s.name}</h3>
          </div>
        ))}
      </div>

      {selectedParty && (
        <div className="border-t border-white/10 pt-8 animate-in slide-in-from-bottom-4 duration-500 relative">
          <div className="absolute top-8 right-0 flex gap-2">
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setEditForm(selectedParty);
              }}
              className="text-xs uppercase tracking-widest text-white/40 hover:text-[#d4af37]"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#d4af37] mb-4">Official Profile</h4>

              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-4 bg-white/5 p-6 border border-white/10">
                  <div>
                    <label className="text-[10px] uppercase text-white/40">Name</label>
                    <input className="w-full bg-[#0a0a0a] text-white p-2 border border-white/10" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-white/40">Role</label>
                    <input className="w-full bg-[#0a0a0a] text-white p-2 border border-white/10" value={editForm.role || ''} onChange={e => setEditForm({ ...editForm, role: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-white/40">Description</label>
                    <textarea className="w-full bg-[#0a0a0a] text-white p-2 border border-white/10 h-24" value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase text-white/40">Alibi</label>
                      <input className="w-full bg-[#0a0a0a] text-white p-2 border border-white/10" value={editForm.alibi || ''} onChange={e => setEditForm({ ...editForm, alibi: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-white/40">Motive</label>
                      <input className="w-full bg-[#0a0a0a] text-white p-2 border border-white/10" value={editForm.motive || ''} onChange={e => setEditForm({ ...editForm, motive: e.target.value })} />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2 bg-[#d4af37] text-black uppercase font-bold text-xs tracking-widest">Save Changes</button>
                </form>
              ) : (
                <>
                  <p className="text-white/80 leading-relaxed mb-8 italic">"{selectedParty.description}"</p>
                  <div className="space-y-6">
                    <section>
                      <h5 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Verified Alibi</h5>
                      <div className="p-4 bg-white/5 border border-white/5 text-sm text-white/70">
                        {selectedParty.alibi || 'No alibi recorded.'}
                      </div>
                    </section>
                    <section>
                      <h5 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Presumed Motive</h5>
                      <div className="p-4 bg-red-900/10 border border-red-900/20 text-sm text-red-100/70">
                        {selectedParty.motive || 'Motive unclear.'}
                      </div>
                    </section>
                  </div>
                </>
              )}
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#d4af37] mb-4">Recorded Statements</h4>
              <div className="space-y-4">
                {statements.filter(st => st.speakerId === selectedParty.id).map(st => (
                  <div key={st.id} className="relative p-6 bg-[#0a0a0a] border border-white/5 italic">
                    <div className="absolute top-0 right-0 p-2 text-[8px] text-white/20 font-mono">{st.timestamp}</div>
                    <span className="text-white/40 text-2xl absolute -top-1 left-2 font-serif">“</span>
                    <p className="text-white/70 text-sm relative z-10">{st.content}</p>
                    <span className="text-white/40 text-2xl absolute -bottom-6 right-4 font-serif">”</span>
                  </div>
                ))}
                {statements.filter(st => st.speakerId === selectedParty.id).length === 0 && (
                  <div className="text-xs text-white/20 uppercase tracking-widest py-8 text-center border border-dashed border-white/10">
                    No recorded statements for this individual
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h5 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Investigator Notes</h5>
                <textarea
                  className="w-full bg-transparent border border-white/5 p-4 text-sm text-white/60 focus:border-[#d4af37] transition-colors outline-none h-32 resize-none"
                  placeholder="Draft your observations here..."
                  defaultValue={selectedParty.notes}
                  onBlur={(e) => { // Save on blur not change to avoid too many writes
                    if (onUpdateParty) {
                      onUpdateParty({ ...selectedParty, notes: e.target.value });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartiesView;
