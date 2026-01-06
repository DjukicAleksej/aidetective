
import React, { useState } from 'react';
import { InvestigationCase, Suspect, TimelineEvent, Clue, Statement, Theory } from '../types';
import SuspectsView from './SuspectsView';
import TimelineView from './TimelineView';
import CluesView from './CluesView';
import StatementsView from './StatementsView';
import TheoriesView from './TheoriesView';
import AccusationView from './AccusationView';
import AIAssistant from './AIAssistant';

interface WorkspaceProps {
  activeCase: InvestigationCase;
  onBack: () => void;
  onUpdateCase: (updatedCase: InvestigationCase) => void;
}

type Tab = 'suspects' | 'timeline' | 'clues' | 'statements' | 'theories' | 'accusation';

import { dbService } from '../services/dbService';

const Workspace: React.FC<WorkspaceProps> = ({ activeCase, onBack, onUpdateCase }) => {
  const [activeTab, setActiveTab] = useState<Tab>('suspects');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(activeCase.title);

  const saveTitle = async () => {
    if (editedTitle.trim() && editedTitle !== activeCase.title) {
      try {
        await dbService.updateCase(activeCase.id, { title: editedTitle });
        onUpdateCase({ ...activeCase, title: editedTitle });
      } catch (e) {
        console.error("Failed to update case title", e);
        alert("Failed to save title");
        setEditedTitle(activeCase.title);
      }
    }
    setIsEditingTitle(false);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'suspects', label: 'Suspects', icon: <UserIcon /> },
    { id: 'timeline', label: 'Timeline', icon: <ClockIcon /> },
    { id: 'clues', label: 'Evidence', icon: <SearchIcon /> },
    { id: 'statements', label: 'Statements', icon: <DocumentIcon /> },
    { id: 'theories', label: 'Theories', icon: <LightbulbIcon /> },
    { id: 'accusation', label: 'Accusation', icon: <GavelIcon /> },
  ];

  const handleAddSuspect = async (suspect: Partial<Suspect>) => {
    try {
      const newSuspect = await dbService.addSuspect(activeCase.id, suspect);
      onUpdateCase({ ...activeCase, parties: [...activeCase.parties, newSuspect] });
    } catch (e) {
      console.error("Failed to add suspect", e);
      alert("Failed to add suspect");
    }
  };

  const handleAddTimelineEvent = async (event: Partial<TimelineEvent>) => {
    try {
      const newEvent = await dbService.addTimelineEvent(activeCase.id, event);
      onUpdateCase({ ...activeCase, timeline: [...activeCase.timeline, newEvent] });
    } catch (e) {
      console.error("Failed to add timeline event", e);
      alert("Failed to add timeline event");
    }
  };

  const handleAddClue = async (clue: Partial<Clue>) => {
    try {
      const newClue = await dbService.addClue(activeCase.id, clue);
      onUpdateCase({ ...activeCase, clues: [newClue, ...activeCase.clues] });
    } catch (e) {
      console.error("Failed to add clue", e);
      alert("Failed to add clue");
    }
  };

  const handleAddStatement = async (statement: Partial<Statement>) => {
    try {
      const newStatement = await dbService.addStatement(activeCase.id, statement);
      onUpdateCase({ ...activeCase, statements: [newStatement, ...activeCase.statements] });
    } catch (e) {
      console.error("Failed to add statement", e);
      alert("Failed to add statement");
    }
  };

  const handleAddTheory = async (theory: Partial<Theory>) => {
    try {
      const newTheory = await dbService.addTheory(activeCase.id, theory);
      onUpdateCase({ ...activeCase, theories: [newTheory, ...activeCase.theories] });
    } catch (e) {
      console.error("Failed to add theory", e);
      alert("Failed to add theory");
    }
  };

  const handleExportCase = () => {
    const dataStr = JSON.stringify(activeCase, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${activeCase.title.replace(/\s+/g, '_').toLowerCase()}_report.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      {/* Sidebar Navigation */}
      <nav className="w-20 lg:w-64 border-r border-white/5 flex flex-col bg-[#0a0a0a]">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
          >
            <BackIcon />
          </button>
          <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-lg object-cover border border-[#d4af37]/20 hidden lg:block shadow-sm" />
          <div className="hidden lg:block flex-1 min-w-0">
            <span className="text-[10px] uppercase tracking-widest text-[#d4af37] block">Active Case</span>
            {isEditingTitle ? (
              <input
                autoFocus
                className="w-full bg-[#050505] border border-[#d4af37] text-white text-xs p-1 outline-none"
                value={editedTitle}
                onChange={e => setEditedTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => e.key === 'Enter' && saveTitle()}
              />
            ) : (
              <div className="group flex items-center justify-between">
                <h2 className="text-xs font-semibold text-white/80 uppercase truncate" title={activeCase.title}>{activeCase.title}</h2>
                <button onClick={() => setIsEditingTitle(true)} className="opacity-0 group-hover:opacity-100 text-[#d4af37] hover:text-white transition-opacity ml-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 py-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-6 py-4 gap-4 transition-all relative ${activeTab === tab.id ? 'text-[#d4af37] bg-white/5' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
            >
              {activeTab === tab.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#d4af37]" />}
              {tab.icon}
              <span className="hidden lg:block uppercase tracking-widest text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-white/5 flex flex-col gap-2 hidden lg:flex">
          <button
            onClick={handleExportCase}
            className="w-full py-2 px-4 border border-white/10 hover:border-[#d4af37]/50 text-white/40 hover:text-[#d4af37] text-[10px] uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Archive
          </button>
          <div className="text-[10px] text-white/20 uppercase tracking-widest pt-2">
            &copy; 2024 Benoit Blanc Investigation
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'suspects' && (
            <SuspectsView
              suspects={activeCase.parties}
              statements={activeCase.statements}
              onUpdateSuspect={async (suspect) => {
                const updatedSuspect = await dbService.updateSuspect(suspect.id, suspect);
                const updated = {
                  ...activeCase,
                  parties: activeCase.parties.map(s => s.id === suspect.id ? updatedSuspect : s)
                };
                onUpdateCase(updated);
              }}
              onAddSuspect={handleAddSuspect}
              onDeleteSuspect={async (id) => {
                if (confirm('Are you sure you want to delete this suspect?')) {
                  await dbService.deleteSuspect(id);
                  onUpdateCase({ ...activeCase, parties: activeCase.parties.filter(s => s.id !== id) });
                }
              }}
            />
          )}
          {activeTab === 'timeline' && (
            <TimelineView
              timeline={activeCase.timeline}
              suspects={activeCase.parties}
              onAddEvent={handleAddTimelineEvent}
              onUpdateEvent={async (event) => {
                const updatedEvent = await dbService.updateTimelineEvent(event.id, event);
                onUpdateCase({ ...activeCase, timeline: activeCase.timeline.map(e => e.id === event.id ? updatedEvent : e) });
              }}
              onDeleteEvent={async (id) => {
                if (confirm('Delete this event?')) {
                  await dbService.deleteTimelineEvent(id);
                  onUpdateCase({ ...activeCase, timeline: activeCase.timeline.filter(e => e.id !== id) });
                }
              }}
            />
          )}
          {activeTab === 'clues' && (
            <CluesView
              clues={activeCase.clues}
              suspects={activeCase.parties}
              onAddClue={handleAddClue}
              onUpdateClue={async (clue) => {
                const updatedClue = await dbService.updateClue(clue.id, clue);
                onUpdateCase({ ...activeCase, clues: activeCase.clues.map(c => c.id === clue.id ? updatedClue : c) });
              }}
              onDeleteClue={async (id) => {
                if (confirm('Delete this evidence?')) {
                  await dbService.deleteClue(id);
                  onUpdateCase({ ...activeCase, clues: activeCase.clues.filter(c => c.id !== id) });
                }
              }}
            />
          )}
          {activeTab === 'statements' && (
            <StatementsView
              statements={activeCase.statements}
              suspects={activeCase.parties}
              onAddStatement={handleAddStatement}
              onUpdateStatement={async (statement) => {
                const updatedSt = await dbService.updateStatement(statement.id, statement);
                onUpdateCase({ ...activeCase, statements: activeCase.statements.map(s => s.id === statement.id ? updatedSt : s) });
              }}
              onDeleteStatement={async (id) => {
                if (confirm('Delete this statement?')) {
                  await dbService.deleteStatement(id);
                  onUpdateCase({ ...activeCase, statements: activeCase.statements.filter(s => s.id !== id) });
                }
              }}
            />
          )}
          {activeTab === 'theories' && (
            <TheoriesView
              theories={activeCase.theories}
              suspects={activeCase.parties}
              clues={activeCase.clues}
              onAddTheory={handleAddTheory}
              onUpdateTheory={async (theory) => {
                const updatedTh = await dbService.updateTheory(theory.id, theory);
                onUpdateCase({ ...activeCase, theories: activeCase.theories.map(t => t.id === theory.id ? updatedTh : t) });
              }}
              onDeleteTheory={async (id) => {
                if (confirm('Delete this theory?')) {
                  await dbService.deleteTheory(id);
                  onUpdateCase({ ...activeCase, theories: activeCase.theories.filter(t => t.id !== id) });
                }
              }}
            />
          )}
          {activeTab === 'accusation' && (
            <AccusationView
              activeCase={activeCase}
              onPresentCase={(suspectId, reasoning) => {
                const updated = {
                  ...activeCase,
                  status: 'Solved' as const
                };
                onUpdateCase(updated);
              }}
            />
          )}
        </div>
      </main>


      {/* Persistent AI Assistant */}
      <aside className="w-80 lg:w-96 border-l border-white/5 bg-[#0a0a0a] flex flex-col">
        <AIAssistant
          activeCase={activeCase}
          onAnalyzeTimeline={() => setActiveTab('timeline')}
          onAnalyzeSuspect={(id) => {
            setActiveTab('suspects');
            // Could scroll to suspect or highlight
          }}
        />
      </aside>
    </div>
  );
};

// --- Icon Components ---
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const ClockIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SearchIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const LightbulbIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.674a1 1 0 01.992.883l.197 1.771a1 1 0 01-.992 1.112H9.466a1 1 0 01-.992-1.112l.197-1.771a1 1 0 01.992-.883zm-2.122-4.912a5 5 0 116.918 0c.427.311.667.8.667 1.314L15.122 17H8.878l.001-3.598c0-.514.24-1.003.667-1.314z" /></svg>;
const GavelIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>;
const BackIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const DocumentIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

export default Workspace;
