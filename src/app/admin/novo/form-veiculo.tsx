'use client'

import { useActionState, useState, useRef, useCallback } from 'react'
import { addVehicle } from './actions'
import Link from 'next/link'
import { ImageUploader } from '@/components/ui/ImageUploader'

// Definimos a interface para aceitar dados para edição
interface FormVeiculoProps {
  cor: string;
  dadosIniciais?: any; // Os dados do carro vindo do Supabase
}

const CV_TO_KW = 0.7355

export function FormVeiculo({ cor, dadosIniciais }: FormVeiculoProps) {
  const [state, formAction, isPending] = useActionState(addVehicle, null)
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Controlled CV/kW with bidirectional conversion
  const [cv, setCv] = useState<string>(dadosIniciais?.potencia_cavalos?.toString() ?? '')
  const [kw, setKw] = useState<string>(dadosIniciais?.potencia_kw?.toString() ?? '')

  const handleCvChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCv(val)
    if (val === '' || isNaN(Number(val))) { setKw(''); return }
    setKw(Math.round(Number(val) * CV_TO_KW).toString())
  }, [])

  const handleKwChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setKw(val)
    if (val === '' || isNaN(Number(val))) { setCv(''); return }
    setCv(Math.round(Number(val) / CV_TO_KW).toString())
  }, [])

  const inputStyle = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 transition-all mt-1"
  const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"

  const nextStep = () => {
    if (formRef.current) {
      // Find current step container by data attribute
      const currentStepContainer = formRef.current.querySelector(`[data-step="${step}"]`)
      const inputs = currentStepContainer?.querySelectorAll('input[required], select[required]')

      
      let isValid = true
      inputs?.forEach((input: any) => {
        if (!input.checkValidity()) {
          input.reportValidity()
          isValid = false
        }
      })
      
      if (!isValid) return
    }
    setStep(s => Math.min(s + 1, 4))
  }
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleGenerateAI = async () => {
    if (!formRef.current) return;
    setIsGenerating(true);
    
    // Simulating AI Generation delay
    await new Promise(r => setTimeout(r, 1500));
    
    const formData = new FormData(formRef.current);
    const marca = formData.get('marca') || 'viatura';
    const modelo = formData.get('modelo') || '';
    const ano = formData.get('ano') || '';
    const cv = formData.get('potencia_cavalos') || '';
    
    const generatedText = `Uma fantástica oportunidade para adquirir este ${marca} ${modelo} de ${ano}.\n\nEsta viatura, equipada com um motor capaz de entregar ${cv}cv, combina performance de alto nível com um conforto inigualável. O seu design exterior reflete o compromisso com a elegância "Effortless Luxury", enquanto o interior garante uma experiência premium em todos os trajetos.\n\nViaturas inspecionadas e com garantia. Não perca esta oportunidade de conduzir um automóvel verdadeiramente exclusivo.`;
    
    const textarea = formRef.current.querySelector('[name="descricao"]') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = generatedText;
    }
    
    setIsGenerating(false);
  }

  const steps = [
    { num: 1, title: 'Identificação' },
    { num: 2, title: 'Especificações' },
    { num: 3, title: 'Descrição' },
    { num: 4, title: 'Fotografias' }
  ];

  return (
    <div className="space-y-8">
      {/* STEPS INDICATOR */}
      <div className="flex items-center justify-between relative before:absolute before:inset-0 before:top-1/2 before:-translate-y-1/2 before:h-0.5 before:bg-slate-200 before:z-0">
        {steps.map(s => (
          <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s.num ? 'text-white' : 'bg-slate-100 text-slate-400'}`}
              style={{ backgroundColor: step >= s.num ? cor : '' }}
            >
              {step > s.num ? '✓' : s.num}
            </div>
            <span className={`text-[10px] uppercase tracking-widest font-bold hidden md:block ${step >= s.num ? 'text-slate-800' : 'text-slate-400'}`}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

    <form action={formAction} ref={formRef} className="space-y-6">
      
      {/* CAMPO ESCONDIDO PARA O ID (Crucial para o Update saber qual carro editar) */}
      <input type="hidden" name="id" value={dadosIniciais?.id || ''} />

      {/* FEEDBACK VISUAL DE ERRO */}
      {state?.error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-bold text-red-800">{state.error}</p>
          </div>
        </div>
      )}

      {/* CARD 1: IDENTIFICAÇÃO */}
      <div data-step="1" style={{ display: step === 1 ? 'block' : 'none' }}>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-right-4">
        <h2 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-3">
          <span className="w-2 h-6 rounded-full" style={{ backgroundColor: cor }}></span>
          Identificação
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className={labelStyle}>Marca</label>
            <input name="marca" defaultValue={dadosIniciais?.marca} required placeholder="Ex: BMW" className={inputStyle} style={{ '--tw-ring-color': cor } as any} />
          </div>
          <div>
            <label className={labelStyle}>Modelo</label>
            <input name="modelo" defaultValue={dadosIniciais?.modelo} required placeholder="Ex: Série 3" className={inputStyle} style={{ '--tw-ring-color': cor } as any} />
          </div>
          <div>
            <label className={labelStyle}>Cor</label>
            <input name="cor" defaultValue={dadosIniciais?.cor} placeholder="Ex: Preto" className={inputStyle} style={{ '--tw-ring-color': cor } as any} />
          </div>
          <div>
            <label className={labelStyle}>Segmento</label>
            <select name="segmento" defaultValue={dadosIniciais?.segmento || ""} className={inputStyle} style={{ '--tw-ring-color': cor } as any}>
              <option value="">Selecione...</option>
              <option value="Utilitário">Utilitário</option>
              <option value="Sedan">Sedan</option>
              <option value="Carrinha">Carrinha</option>
              <option value="SUV">SUV</option>
              <option value="Desportivo">Desportivo</option>
            </select>
          </div>
        </div>
      </div>
      </div>

      {/* CARD 2: ESPECIFICAÇÕES E PREÇO */}
      <div data-step="2" style={{ display: step === 2 ? 'block' : 'none' }}>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-right-4">
        <h2 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-3">
          <span className="w-2 h-6 rounded-full" style={{ backgroundColor: cor }}></span>
          Especificações e Preço
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          <div>
            <label className={labelStyle}>Matrícula</label>
            <input name="matricula" defaultValue={dadosIniciais?.matricula} required placeholder="00-AA-00" className={`${inputStyle} uppercase font-bold`} style={{ '--tw-ring-color': cor } as any} />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className={labelStyle}>VIN (Nº de Quadro)</label>
            <input name="vin" defaultValue={dadosIniciais?.vin} placeholder="Ex: WVWZZZ..." className={`${inputStyle} uppercase font-mono`} style={{ '--tw-ring-color': cor } as any} />
          </div>

          <div className="md:col-span-1 lg:col-span-1">
            <label className={labelStyle}>Preço Compra (€)</label>
            <input name="preco_compra" defaultValue={dadosIniciais?.preco_compra} type="number" step="0.01" placeholder="0.00" className={`${inputStyle} text-slate-500`} style={{ '--tw-ring-color': cor } as any} />
          </div>

          <div className="md:col-span-1 lg:col-span-2">
            <label className={labelStyle}>Preço Venda (€)</label>
            <input name="preco" defaultValue={dadosIniciais?.preco} type="number" step="0.01" required placeholder="0.00" className={`${inputStyle} font-black text-lg text-slate-800`} style={{ '--tw-ring-color': cor } as any} />
          </div>
          
          <div>
            <label className={labelStyle}>Ano</label>
            <input name="ano" defaultValue={dadosIniciais?.ano} type="number" required placeholder="2024" className={inputStyle} style={{ '--tw-ring-color': cor } as any} />
          </div>
          
          <div>
            <label className={labelStyle}>Quilómetros (km)</label>
            <input name="km" defaultValue={dadosIniciais?.km} type="number" required placeholder="0" className={inputStyle} style={{ '--tw-ring-color': cor } as any} />
          </div>
          
          <div>
            <label className={labelStyle}>Combustível</label>
            <select name="combustivel" defaultValue={dadosIniciais?.combustivel || "Diesel"} className={inputStyle} style={{ '--tw-ring-color': cor } as any}>
              <option value="Diesel">Diesel</option>
              <option value="Gasolina">Gasolina</option>
              <option value="Híbrido">Híbrido</option>
              <option value="Elétrico">Elétrico</option>
            </select>
          </div>
          
          <div>
            <label className={labelStyle}>Transmissão</label>
            <select name="transmissao" defaultValue={dadosIniciais?.transmissao || "Manual"} className={inputStyle} style={{ '--tw-ring-color': cor } as any}>
              <option value="Manual">Manual</option>
              <option value="Automática">Automática</option>
            </select>
          </div>
          
          <div>
            <label className={labelStyle}>
              Cavalos (CV)
              {kw && <span className="ml-2 text-slate-400 font-normal normal-case">≈ {kw} kW</span>}
            </label>
            <input
              name="potencia_cavalos"
              value={cv}
              onChange={handleCvChange}
              type="number"
              placeholder="Ex: 150"
              className={inputStyle}
              style={{ '--tw-ring-color': cor } as any}
            />
          </div>

          <div>
            <label className={labelStyle}>
              Potência (kW)
              {cv && <span className="ml-2 text-slate-400 font-normal normal-case">≈ {cv} CV</span>}
            </label>
            <input
              name="potencia_kw"
              value={kw}
              onChange={handleKwChange}
              type="number"
              placeholder="Ex: 110"
              className={inputStyle}
              style={{ '--tw-ring-color': cor } as any}
            />
          </div>
          
          <div>
            <label className={labelStyle}>Cilindrada (cc)</label>
            <input name="cilindrada" defaultValue={dadosIniciais?.cilindrada} type="number" placeholder="Ex: 1998" className={inputStyle} style={{ '--tw-ring-color': cor } as any} />
          </div>

          <div className="md:col-span-3 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
            <div>
              <label className={labelStyle}>Estado da Viatura</label>
              <select 
                name="status" 
                defaultValue={dadosIniciais?.status || "disponivel"} 
                className={`${inputStyle} font-bold ${dadosIniciais?.status === 'vendido' ? 'text-red-600' : 'text-primary'}`}
                style={{ '--tw-ring-color': cor } as any}
              >
                <option value="disponivel">✓ Em Stock (Disponível)</option>
                <option value="negociacao">🤝 Em Negociação (Pipeline de Compra)</option>
                <option value="reservado">🕒 Reservado</option>
                <option value="vendido">💰 Vendido</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1 ml-1">Vendas aparecem no inventário público. Negociações são privadas.</p>
            </div>

            <div className="flex items-center gap-8 pt-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="importado" defaultChecked={dadosIniciais?.importado} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all" />
                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Viatura Importada</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="oculto" defaultChecked={dadosIniciais?.oculto} className="w-5 h-5 rounded border-slate-300 text-slate-500 focus:ring-slate-600 transition-all" />
                <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Ocultar do Site</span>
              </label>
            </div>
          </div>

        </div>
      </div>
      </div>

      {/* CARD 3: DESCRIÇÃO */}
      <div data-step="3" style={{ display: step === 3 ? 'block' : 'none' }}>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-right-4">
        <h2 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-3">
          <span className="w-2 h-6 rounded-full" style={{ backgroundColor: cor }}></span>
          Descrição Comercial
        </h2>
        <div>
          <label className={labelStyle}>Detalhes da viatura</label>
          <textarea 
            name="descricao" 
            defaultValue={dadosIniciais?.descricao}
            rows={5} 
            className={`${inputStyle} resize-none mt-2`}
            style={{ '--tw-ring-color': cor } as any}
            placeholder="Extras, histórico de revisões..."
          ></textarea>
          <button 
            type="button" 
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            {isGenerating ? 'A gerar texto...' : 'Gerar Descrição com IA'}
          </button>
        </div>
      </div>
      </div>

      {/* CARD 4: FOTOS */}
      <div data-step="4" style={{ display: step === 4 ? 'block' : 'none' }}>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-right-4">
        <h2 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-3">
          <span className="w-2 h-6 rounded-full" style={{ backgroundColor: cor }}></span>
          Fotografias
        </h2>
        <ImageUploader cor={cor} imagensIniciais={dadosIniciais?.imagens || []} />
      </div>
      </div>

      {/* BOTÕES DE NAVEGAÇÃO DO WIZARD */}
      <div className="flex flex-col md:flex-row gap-4 pt-6 mt-8 border-t border-slate-100">
        {step > 1 && (
          <button 
            type="button" 
            onClick={prevStep}
            className="flex-1 py-4 bg-white text-slate-500 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 flex justify-center items-center shadow-sm"
          >
            Passo Anterior
          </button>
        )}
        
        {step < 4 ? (
          <button 
            type="button" 
            onClick={nextStep}
            className="flex-[2] py-4 text-white font-black rounded-2xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-3"
            style={{ backgroundColor: cor }}
          >
            Próximo Passo
          </button>
        ) : (
          <button 
            type="submit" 
            disabled={isPending}
            className="flex-[2] py-4 text-white font-black rounded-2xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex justify-center items-center gap-3"
            style={{ backgroundColor: cor }}
          >
            {isPending ? 'A gravar...' : dadosIniciais ? 'Atualizar Viatura' : 'Gravar Veículo'}
          </button>
        )}
        
        <Link 
          href="/admin" 
          className="flex-1 py-4 bg-transparent text-slate-400 font-bold hover:text-slate-600 flex justify-center items-center"
        >
          Cancelar
        </Link>
      </div>
    </form>
    </div>
  )
}