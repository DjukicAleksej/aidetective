
import React, { useState, useCallback, useEffect } from 'react';
import { InvestigationCase } from './types';

import { dbService } from './services/dbService';
import AuthView from './components/AuthView';
import Dashboard from './components/Dashboard';
import Workspace from './components/Workspace';

const App: React.FC = () => {
  const [session, setSession] = useState<boolean>(true);
  const [activeCase, setActiveCase] = useState<InvestigationCase | null>(null);
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [isLoading, setIsLoading] = useState(false); // No auth loading needed

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setIsLoading(true);
      const fetchedCases = await dbService.getCases();
      setCases(fetchedCases);
    } catch (error) {
      console.warn('Failed to fetch cases from DB:', error);
      // Optional: Fallback to mock data if DB is empty or fails? 
      // For now, let's keep it clean and just rely on DB or empty state.
      // But for demo purposes, if DB returns empty, maybe we want to keep one mock case?
      // actually apiService fallback was useful. Let's rely on empty for now to force using the DB.
      setCases([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCase = useCallback((caseToSelect: InvestigationCase) => {
    setActiveCase(caseToSelect);
  }, []);

  const handleUpdateCase = useCallback(async (updatedCase: InvestigationCase) => {
    try {
      // Optimistic update
      setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
      setActiveCase(updatedCase);

      // TODO: Implement updateCase in dbService
      // await dbService.updateCase(updatedCase);
    } catch (error) {
      console.error('Failed to update case:', error);
    }
  }, []);

  const handleBack = useCallback(() => {
    setActiveCase(null);
    loadCases(); // Refresh list on back
  }, []);

  const handleNewCase = useCallback(async () => {
    // Create a new case template
    const newCaseData: Partial<InvestigationCase> = {
      title: 'New Investigation',
      description: 'A new mystery waiting to be solved.',
      status: 'Open'
    };

    try {
      const createdCase = await dbService.createCase(newCaseData);
      setCases(prev => [createdCase, ...prev]);
      setActiveCase(createdCase);
    } catch (err) {
      console.error("Failed to create case:", err);
    }
  }, []);

  const handleDeleteCase = useCallback(async (caseId: string) => {
    try {
      await dbService.deleteCase(caseId);
      setCases(prev => prev.filter(c => c.id !== caseId));
    } catch (err) {
      console.error("Failed to delete case:", err);
      alert("Failed to delete case. Please try again.");
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-serif text-lg">Loading archives...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthView onAuthSuccess={() => loadCases()} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      {activeCase ? (
        <Workspace
          activeCase={activeCase}
          onBack={handleBack}
          onUpdateCase={handleUpdateCase}
        />
      ) : (
        <Dashboard
          cases={cases}
          onSelectCase={handleSelectCase}
          onNewCase={handleNewCase}
          onDeleteCase={handleDeleteCase}
        />
      )}
    </div>
  );
};

export default App;
