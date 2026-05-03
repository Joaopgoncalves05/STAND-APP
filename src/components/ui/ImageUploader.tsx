'use client';

import { useState, useRef, useEffect } from 'react';

interface ImageUploaderProps {
  cor: string;
  imagensIniciais?: string[];
}

export function ImageUploader({ cor, imagensIniciais = [] }: ImageUploaderProps) {
  const [retainedImages, setRetainedImages] = useState<string[]>(imagensIniciais);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate previews for new files
  useEffect(() => {
    const urls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [newFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveExisting = (urlToRemove: string) => {
    setRetainedImages(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleRemoveNew = (indexToRemove: number) => {
    setNewFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Sync newFiles state with a hidden file input before form submission
  // Note: We use a DataTransfer object to update the FileList programmatically
  useEffect(() => {
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      newFiles.forEach(file => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
    }
  }, [newFiles]);

  return (
    <div className="space-y-4">
      {/* Hidden inputs for retained images */}
      {retainedImages.map((url, i) => (
        <input key={i} type="hidden" name="retained_images" value={url} />
      ))}

      {/* Hidden file input for new images to be submitted with form */}
      <input 
        type="file" 
        name="novas_imagens" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Existing Images */}
        {retainedImages.map((url) => (
          <div key={url} className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden group border border-slate-200">
            <img src={url} alt="Viatura" className="w-full h-full object-cover" />
            <button 
              type="button"
              onClick={() => handleRemoveExisting(url)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        ))}

        {/* New Images */}
        {previewUrls.map((url, idx) => (
          <div key={url} className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden group border-2 border-dashed border-green-400">
            <img src={url} alt="Nova" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">NOVA</span>
            </div>
            <button 
              type="button"
              onClick={() => handleRemoveNew(idx)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm z-10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}

        {/* Add Button */}
        <label className="aspect-video bg-slate-50 hover:bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer transition-colors group">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-primary mb-2 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
          <span className="text-xs font-bold text-slate-500">Adicionar Fotos</span>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleFileSelect}
            className="hidden" 
          />
        </label>
      </div>
      
      <p className="text-xs text-slate-400 font-bold mt-2">Formatos aceites: JPG, PNG, WEBP. A primeira imagem será a capa do veículo.</p>
    </div>
  );
}
