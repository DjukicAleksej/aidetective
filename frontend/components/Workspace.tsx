
import React, { useState } from 'react';
import { InvestigationCase } from '../types';
import SuspectsView from './SuspectsView';
import TimelineView from './TimelineView';
import CluesView from './CluesView';
import TheoriesView from './TheoriesView';
import AccusationView from './AccusationView';
import AIAssistant from './AIAssistant';

interface WorkspaceProps {
  activeCase: InvestigationCase;
  onBack: () => void;
}

type Tab = 'suspects' | 'timeline' | 'clues' | 'theories' | 'accusation';

const Workspace: React.FC<WorkspaceProps> = ({ activeCase, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('suspects');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'suspects', label: 'Suspects', icon: <UserIcon /> },
    { id: 'timeline', label: 'Timeline', icon: <ClockIcon /> },
    { id: 'clues', label: 'Evidence', icon: <SearchIcon /> },
    { id: 'theories', label: 'Theories', icon: <LightbulbIcon /> },
    { id: 'accusation', label: 'Accusation', icon: <GavelIcon /> },
  ];

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
          <div className="hidden lg:block">
             <span className="text-[10px] uppercase tracking-widest text-[#d4af37] block">Active Case</span>
             <h2 className="text-xs font-semibold text-white/80 uppercase truncate">{activeCase.title}</h2>
          </div>
        </div>

        <div className="flex-1 py-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-6 py-4 gap-4 transition-all relative ${
                activeTab === tab.id ? 'text-[#d4af37] bg-white/5' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              {activeTab === tab.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#d4af37]" />}
              {tab.icon}
              <span className="hidden lg:block uppercase tracking-widest text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 text-[10px] text-white/20 uppercase tracking-widest border-t border-white/5 hidden lg:block">
          &copy; 1924 Thorne Investigation
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'suspects' && <SuspectsView suspects={activeCase.suspects} statements={activeCase.statements} />}
          {activeTab === 'timeline' && <TimelineView timeline={activeCase.timeline} />}
          {activeTab === 'clues' && <CluesView clues={activeCase.clues} />}
          {activeTab === 'theories' && <TheoriesView theories={activeCase.theories} />}
          {activeTab === 'accusation' && <AccusationView suspects={activeCase.suspects} />}
        </div>
      </main>

      {/* Persistent AI Assistant */}
      <aside className="w-80 lg:w-96 border-l border-white/5 bg-[#0a0a0a] flex flex-col">
        <AIAssistant activeCase={activeCase} />
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

export default Workspace;
