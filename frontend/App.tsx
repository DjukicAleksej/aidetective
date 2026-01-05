
import React, { useState } from 'react';
import { InvestigationCase } from './types';
import { MOCK_CASES } from './data';
import Dashboard from './components/Dashboard';
import Workspace from './components/Workspace';

const App: React.FC = () => {
  const [activeCase, setActiveCase] = useState<InvestigationCase | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      {activeCase ? (
        <Workspace 
          activeCase={activeCase} 
          onBack={() => setActiveCase(null)} 
        />
      ) : (
        <Dashboard 
          cases={MOCK_CASES} 
          onSelectCase={(c) => setActiveCase(c)} 
        />
      )}
    </div>
  );
};

export default App;
