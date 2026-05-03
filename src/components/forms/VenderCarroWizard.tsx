'use client';

import { useState } from 'react';
import { submitLead } from '@/app/actions/leads';

interface VenderCarroWizardProps {
  cor: string;
}

export function VenderCarroWizard({ cor }: VenderCarroWizardProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append('tipo', 'venda');
    
    // Add selected files to formData
    selectedFiles.forEach((file) => {
      formData.append('fotos', file);
    });
    
    const result = await submitLead(formData);
    
    setIsSubmitting(false);
    if (result.success) {
      setIsSuccess(true);
      setSelectedFiles([]);
      setPreviews([]);
    } else {
      alert(result.error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      alert('Máximo de 5 fotos permitido');
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 focus:border-black focus:ring-1 focus:ring-black rounded-xl px-5 py-4 text-black outline-none transition-all";
  const labelClass = "text-xs font-bold uppercase text-slate-500 mb-2 block tracking-widest";

  if (isSuccess) {
    return (
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl text-center animate-in fade-in slide-in-from-bottom-4">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-black text-black mb-4 uppercase tracking-tight">Recebemos o seu pedido!</h2>
        <p className="text-slate-500 text-lg font-light leading-relaxed mb-8">
          A nossa equipa vai analisar as informações da sua viatura e entraremos em contacto em breve com uma estimativa de valorização.
        </p>
        <button 
          onClick={() => { setStep(1); setIsSuccess(false); }}
          className="bg-slate-100 text-black font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-slate-200 transition-colors duration-300"
        >
          Enviar Nova Viatura
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-black uppercase tracking-tight">Avaliar Viatura</h2>
        <div className="flex gap-2">
          {[1, 2, 3].map((num) => (
            <div 
              key={num} 
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${step >= num ? 'bg-black' : 'bg-slate-200'}`}
              style={step >= num ? { backgroundColor: cor } : {}}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* PASSO 1: INFORMAÇÕES DO CARRO */}
        <div style={{ display: step === 1 ? 'block' : 'none' }} className="animate-in fade-in slide-in-from-right-4">
          <h3 className="text-sm font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">1. Dados da Viatura</h3>
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Marca</label>
              <input required={step === 1} name="marca" className={inputClass} placeholder="Ex: BMW" type="text" />
            </div>
            <div>
              <label className={labelClass}>Modelo</label>
              <input required={step === 1} name="modelo" className={inputClass} placeholder="Ex: Série 3" type="text" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Ano</label>
                <input required={step === 1} name="ano" className={inputClass} placeholder="Ex: 2024" type="number" />
              </div>
              <div>
                <label className={labelClass}>Matrícula</label>
                <input required={step === 1} name="matricula" className={inputClass} placeholder="00-AA-00" type="text" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Estado do Veículo</label>
              <select name="estado" className={inputClass} required={step === 1}>
                <option value="">Selecione o estado...</option>
                <option value="Excelente">Excelente</option>
                <option value="Bom">Bom</option>
                <option value="Mau">Mau</option>
                <option value="Muito Mau">Muito Mau</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Informações Adicionais</label>
              <textarea 
                name="informacoes_adicionais" 
                className={`${inputClass} min-h-[100px] py-4 resize-none`} 
                placeholder="Descreva detalhes como extras, revisões ou danos conhecidos..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* PASSO 2: FOTOS */}
        <div style={{ display: step === 2 ? 'block' : 'none' }} className="animate-in fade-in slide-in-from-right-4">
          <h3 className="text-sm font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">2. Fotografias (Opcional)</h3>
          <p className="text-sm text-slate-500 mb-6 font-light">Para uma avaliação mais rigorosa, por favor anexe algumas fotos do exterior e interior do veículo.</p>
          
          <input 
            type="file" 
            id="foto-upload" 
            multiple 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
          />
          
          <div 
            onClick={() => document.getElementById('foto-upload')?.click()}
            className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-black transition-colors cursor-pointer group bg-slate-50 mb-6"
          >
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-4 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-bold text-slate-600">Clique para adicionar fotos</p>
            <p className="text-xs text-slate-400 mt-2">Máximo 5 fotos (JPG, PNG)</p>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group">
                  <img src={preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PASSO 3: DADOS DE CONTACTO */}
        <div style={{ display: step === 3 ? 'block' : 'none' }} className="animate-in fade-in slide-in-from-right-4">
          <h3 className="text-sm font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">3. Os Seus Dados</h3>
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Nome Completo</label>
              <input required={step === 3} name="nome" className={inputClass} placeholder="O seu nome" type="text" />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input required={step === 3} name="email" className={inputClass} placeholder="geral@exemplo.pt" type="email" />
            </div>
            <div>
              <label className={labelClass}>Telemóvel</label>
              <input required={step === 3} name="telemovel" className={inputClass} placeholder="910 000 000" type="tel" />
            </div>
            
            <div className="pt-2">
              <label className={labelClass}>Como prefere ser contactado?</label>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-black transition-colors has-[:checked]:border-black has-[:checked]:bg-slate-50">
                  <input type="radio" name="preferencia_contacto" value="whatsapp" className="w-4 h-4 text-black focus:ring-black" defaultChecked />
                  <span className="text-sm font-bold text-slate-800">WhatsApp</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-black transition-colors has-[:checked]:border-black has-[:checked]:bg-slate-50">
                  <input type="radio" name="preferencia_contacto" value="email" className="w-4 h-4 text-black focus:ring-black" />
                  <span className="text-sm font-bold text-slate-800">Email</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DO WIZARD */}
        <div className="flex gap-4 pt-4 mt-6">
          {step > 1 && (
            <button 
              type="button" 
              onClick={prevStep}
              className="flex-1 bg-white border border-slate-200 text-black font-bold text-sm uppercase tracking-widest py-4 rounded-xl hover:bg-slate-50 transition-colors duration-300"
            >
              Anterior
            </button>
          )}
          
          {step < 3 ? (
            <button 
              type="button" 
              onClick={nextStep}
              className="flex-[2] bg-black text-white font-bold text-sm uppercase tracking-widest py-4 rounded-xl hover:bg-slate-800 transition-colors duration-300 shadow-xl"
              style={{ backgroundColor: cor }}
            >
              Próximo Passo
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-[2] bg-black text-white font-bold text-sm uppercase tracking-widest py-4 rounded-xl hover:bg-slate-800 transition-colors duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
              style={{ backgroundColor: cor }}
            >
              {isSubmitting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  A Enviar...
                </>
              ) : (
                'Enviar Pedido'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
