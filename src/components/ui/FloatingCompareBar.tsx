'use client';

import { useCompare } from '@/context/CompareContext';
import { useRouter, usePathname } from 'next/navigation';

export function FloatingCompareBar() {
  const { compareIds, clearCompare } = useCompare();
  const router = useRouter();
  const pathname = usePathname();

  if (compareIds.length === 0 || pathname === '/comparador') return null;

  const handleCompareClick = () => {
    router.push(`/comparador?ids=${compareIds.join(',')}`);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 shadow-2xl rounded-full">
      <div className="bg-slate-900 text-white px-6 py-4 rounded-full flex items-center gap-6 border border-slate-700">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-black text-sm">
            {compareIds.length}
          </div>
          <span className="font-bold text-sm hidden sm:block">
            {compareIds.length === 1 ? 'viatura selecionada' : 'viaturas selecionadas'}
          </span>
        </div>

        <div className="w-px h-6 bg-slate-700 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <button 
            onClick={clearCompare}
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            Limpar
          </button>
          
          <button 
            onClick={handleCompareClick}
            disabled={compareIds.length < 2}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
              compareIds.length >= 2 
                ? 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/30 scale-105' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Comparar
          </button>
        </div>

      </div>
    </div>
  );
}
