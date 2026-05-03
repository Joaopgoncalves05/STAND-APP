'use client';

import { useCompare } from '@/context/CompareContext';

interface CompareButtonProps {
  carId: string;
}

export function CompareButton({ carId }: CompareButtonProps) {
  const { toggleCompare, isComparing } = useCompare();
  const selected = isComparing(carId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // Evitar navegação do Link no CarCard
        e.stopPropagation();
        toggleCompare(carId);
      }}
      className={`absolute top-4 right-4 z-20 p-2.5 rounded-full shadow-sm backdrop-blur-sm transition-all ${
        selected 
          ? 'bg-primary text-white border-2 border-primary scale-110' 
          : 'bg-white/90 text-slate-400 border-2 border-transparent hover:text-primary hover:bg-white'
      }`}
      title={selected ? "Remover da comparação" : "Adicionar à comparação"}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {selected ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 16l-3-9m-9 11v-5m0 0L8 7m4 4l4-4" />
        )}
      </svg>
    </button>
  );
}
