'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CompareContextType {
  compareIds: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  isComparing: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Carregar do localStorage ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem('@stand-app:compare');
    if (saved) {
      try {
        setCompareIds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Guardar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('@stand-app:compare', JSON.stringify(compareIds));
  }, [compareIds]);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 3) {
        alert('Só pode comparar até 3 viaturas em simultâneo.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const clearCompare = () => setCompareIds([]);

  const isComparing = (id: string) => compareIds.includes(id);

  return (
    <CompareContext.Provider value={{ compareIds, toggleCompare, clearCompare, isComparing }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
