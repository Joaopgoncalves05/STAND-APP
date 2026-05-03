import React from 'react';

interface CarImageCarouselProps {
  imagens?: string[];
  altTitle: string;
}

export function CarImageCarousel({ imagens, altTitle }: CarImageCarouselProps) {
  if (!imagens || imagens.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-300 shrink-0 bg-slate-100">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </div>
    );
  }

  if (imagens.length === 1) {
    return <img src={imagens[0]} alt={altTitle} className="w-full h-full object-cover" />;
  }

  return (
    <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {imagens.map((img, i) => (
        <div key={i} className="w-full h-full shrink-0 snap-center relative group/img">
          <img src={img} alt={`${altTitle} - Foto ${i+1}`} className="w-full h-full object-cover" />
          <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover/img:opacity-100 transition-opacity">
            {i + 1} / {imagens.length}
          </div>
        </div>
      ))}
    </div>
  );
}
