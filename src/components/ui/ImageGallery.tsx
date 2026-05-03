'use client';

import { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0]);

  if (!images || images.length === 0) {
    return (
      <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-200">
        <div className="aspect-[16/9] md:aspect-[21/9] bg-slate-100 rounded-[1.5rem] relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-slate-400 font-bold">Galeria de Imagens Indisponível</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-200">
      {/* Imagem Principal */}
      <div className="aspect-[16/9] md:aspect-[21/9] bg-slate-100 rounded-[1.5rem] relative overflow-hidden">
        <img 
          src={mainImage} 
          alt="Imagem Principal da Viatura" 
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>
      
      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-4 mt-4 px-2 pb-2 overflow-x-auto snap-x">
          {images.map((img, i) => (
            <button 
              key={i} 
              onClick={() => setMainImage(img)}
              className={`w-24 h-24 shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all snap-start ${
                mainImage === img ? 'border-primary shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Miniatura ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
