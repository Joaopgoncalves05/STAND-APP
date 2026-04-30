'use client'

import { useActionState } from 'react'
import { addVehicle } from './actions'
import Link from 'next/link'

// Definimos a interface para aceitar dados para edição
interface FormVeiculoProps {
  cor: string;
  dadosIniciais?: any; // Os dados do carro vindo do Supabase
}

export function FormVeiculo({ cor, dadosIniciais }: FormVeiculoProps) {
  const [state, formAction, isPending] = useActionState(addVehicle, null)

  const inputStyle = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 transition-all mt-1"
  const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"

  return (
    <form action={formAction} className="space-y-6">
      
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
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
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

      {/* CARD 2: ESPECIFICAÇÕES E PREÇO */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
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

          <div className="md:col-span-2">
            <label className={labelStyle}>Preço (€)</label>
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
            <label className={labelStyle}>Cavalos (cv)</label>
            <input name="potencia_cavalos" defaultValue={dadosIniciais?.potencia_cavalos} type="number" placeholder="Ex: 150" className={inputStyle} style={{ '--tw-ring-color': cor } as any} />
          </div>

          <div>
            <label className={labelStyle}>Potência (kW)</label>
            <input name="potencia_kw" defaultValue={dadosIniciais?.potencia_kw} type="number" placeholder="Ex: 110" className={inputStyle} style={{ '--tw-ring-color': cor } as any} />
          </div>
          
          <div>
            <label className={labelStyle}>Cilindrada (cc)</label>
            <input name="cilindrada" defaultValue={dadosIniciais?.cilindrada} type="number" placeholder="Ex: 1998" className={inputStyle} style={{ '--tw-ring-color': cor } as any} />
          </div>

          <div className="flex items-center pt-4 md:col-span-3 lg:col-span-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" name="importado" defaultChecked={dadosIniciais?.importado} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all" />
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Viatura Importada</span>
            </label>
          </div>
        </div>
      </div>

      {/* CARD 3: DESCRIÇÃO */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
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
        </div>
      </div>

      {/* BOTÕES */}
      <div className="flex flex-col md:flex-row gap-4 pt-2">
        <button 
          type="submit" 
          disabled={isPending}
          className="flex-[2] py-4 text-white font-black rounded-2xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex justify-center items-center gap-3"
          style={{ backgroundColor: cor }}
        >
          {isPending ? 'A gravar...' : dadosIniciais ? 'Atualizar Viatura' : 'Gravar Veículo'}
        </button>
        
        <Link 
          href="/admin" 
          className="flex-1 py-4 bg-white text-slate-500 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 flex justify-center items-center shadow-sm"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}