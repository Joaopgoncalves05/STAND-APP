'use client'

import { useState } from 'react'
import { Stand } from '@/utils/tenant'
import { updateStandConfig } from './actions'
import { toast } from 'sonner' // Presuming sonner is available or similar toast utility

export function ConfigClient({ stand }: { stand: Stand }) {
  const [loading, setLoading] = useState(false)
  const [nome, setNome] = useState(stand.nome)
  const [cor, setCor] = useState(stand.cor_primaria || '#3b82f6')
  const [comissaoTipo, setComissaoTipo] = useState<'fixo' | 'percentagem'>(
    (stand as any).comissao_tipo || 'fixo'
  )
  const [comissaoValor, setComissaoValor] = useState<number>(
    (stand as any).comissao_valor || 0
  )

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    const res = await updateStandConfig({
      nome,
      cor_primaria: cor,
      comissao_tipo: comissaoTipo,
      comissao_valor: comissaoValor
    })

    if (res.success) {
      alert('Configurações actualizadas com sucesso!')
    } else {
      alert('Erro ao guardar: ' + res.error)
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
      <div className="p-8 border-b border-slate-50">
        <h1 className="text-3xl font-black tracking-tight">Configurações do Stand</h1>
        <p className="text-slate-400 mt-1">Personalize o branding e regras de negócio do seu stand.</p>
      </div>

      <form onSubmit={handleSave} className="p-8 space-y-10">
        
        {/* Branding Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.172-1.172a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 115.656-5.656z"></path></svg>
            </div>
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400">Identidade & Visual</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nome do Stand</label>
              <input 
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold focus:border-slate-400 focus:outline-none transition-colors"
                placeholder="Ex: Luxe Auto"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Cor Principal</label>
              <div className="flex gap-3">
                <input 
                  type="color"
                  value={cor}
                  onChange={e => setCor(e.target.value)}
                  className="w-12 h-12 rounded-lg border-0 p-0 overflow-hidden cursor-pointer bg-transparent"
                />
                <input 
                  value={cor}
                  onChange={e => setCor(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-mono text-sm focus:border-slate-400 focus:outline-none transition-colors"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </section>

        <hr className="border-slate-50" />

        {/* Financial Rules Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h2 className="text-lg font-black uppercase tracking-widest text-slate-400">Regras de Comissão</h2>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Modelo de Cálculo</label>
                <div className="flex flex-col gap-2">
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${comissaoTipo === 'fixo' ? 'bg-white border-orange-500 shadow-sm' : 'bg-transparent border-transparent hover:bg-white/50'}`}>
                    <input 
                      type="radio" 
                      name="tipo" 
                      checked={comissaoTipo === 'fixo'} 
                      onChange={() => setComissaoTipo('fixo')}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${comissaoTipo === 'fixo' ? 'border-orange-500' : 'border-slate-300'}`}>
                      {comissaoTipo === 'fixo' && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                    </div>
                    <div>
                      <p className="font-black text-sm">Valor Fixo</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Comissão igual para todas as vendas</p>
                    </div>
                  </label>
                  
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${comissaoTipo === 'percentagem' ? 'bg-white border-orange-500 shadow-sm' : 'bg-transparent border-transparent hover:bg-white/50'}`}>
                    <input 
                      type="radio" 
                      name="tipo" 
                      checked={comissaoTipo === 'percentagem'} 
                      onChange={() => setComissaoTipo('percentagem')}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${comissaoTipo === 'percentagem' ? 'border-orange-500' : 'border-slate-300'}`}>
                      {comissaoTipo === 'percentagem' && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                    </div>
                    <div>
                      <p className="font-black text-sm">Percentagem sobre Margem</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Calculado sobre o lucro da venda</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  {comissaoTipo === 'fixo' ? 'Valor da Comissão (€)' : 'Percentagem (%)'}
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    step="0.01"
                    value={comissaoValor}
                    onChange={e => setComissaoValor(Number(e.target.value))}
                    className="w-full px-5 py-4 rounded-xl border border-slate-200 font-black text-2xl focus:border-orange-500 focus:outline-none transition-colors pr-12"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl pointer-events-none">
                    {comissaoTipo === 'fixo' ? '€' : '%'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Buttons */}
        <div className="pt-4 flex items-center justify-between">
          <p className="text-xs text-slate-400 italic font-medium">* Estas alterações afectam apenas vendas futuras.</p>
          <button 
            type="submit"
            disabled={loading}
            className="px-10 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#e35a39] disabled:bg-slate-200 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            {loading ? 'A Guardar...' : 'Guardar Alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}
