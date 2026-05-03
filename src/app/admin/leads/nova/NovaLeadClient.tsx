'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createLeadManual } from '../actions'

export function NovaLeadClient({ 
  vendedores, 
  carros, 
  clientes,
  currentUserId 
}: { 
  vendedores: any[], 
  carros: any[], 
  clientes: any[],
  currentUserId: string 
}) {
  const [tipo, setTipo] = useState('venda') 
  const [isNewClient, setIsNewClient] = useState(true)
  const [selectedClientId, setSelectedClientId] = useState('')
  const [searchClient, setSearchClient] = useState('')
  
  // States for new vehicle (only for Acquisition/Venda-Cliente-Vende)
  const [newVehicle, setNewVehicle] = useState({
    marca: '', modelo: '', ano: new Date().getFullYear().toString(),
    matricula: '', km: '', preco_compra: '', combustivel: 'diesel',
    transmissao: 'manual'
  })

  return (
    <div className="min-h-screen bg-[#f9f9f9] font-['Manrope'] text-[#1b1b1b] p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/leads" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Criar Nova Lead</h1>
            <p className="text-sm text-slate-500 mt-1">Insira os dados manualmente para uma nova oportunidade.</p>
          </div>
        </div>

        <form 
          action={async (formData) => {
            const res = await createLeadManual(formData)
            if (res?.error) alert(res.error)
          }} 
          className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-8"
        >
          
          {/* 1. Tipo de Lead (Crucial para o fluxo) */}
          <section>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Tipo de Oportunidade</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'venda', label: 'Venda (Stand vende)', icon: '💰' },
                { id: 'compra', label: 'Compra (Stand compra)', icon: '📦' },
                { id: 'contacto', label: 'Contacto Geral', icon: '📞' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTipo(t.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    tipo === t.id 
                      ? 'border-black bg-slate-50 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-widest">{t.label}</span>
                </button>
              ))}
              <input type="hidden" name="tipo" value={tipo} />
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* 2. Dados do Cliente */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Dados do Cliente</p>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                <button 
                  type="button" 
                  onClick={() => setIsNewClient(true)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${isNewClient ? 'bg-white text-black shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Novo Cliente
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsNewClient(false)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${!isNewClient ? 'bg-white text-black shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Existente
                </button>
              </div>
            </div>

            {isNewClient ? (
              <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-1 duration-200">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Nome *</label>
                  <input 
                    required={isNewClient} 
                    name="nome" 
                    type="text" 
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black" 
                    placeholder="Nome do cliente" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Telemóvel</label>
                  <input name="telemovel" type="tel" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black" placeholder="Nº telemóvel" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">E-mail</label>
                  <input name="email" type="email" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black" placeholder="endereco@email.com" />
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Pesquisar Cliente</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={searchClient}
                      onChange={(e) => setSearchClient(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-black" 
                      placeholder="Pesquise por nome, e-mail ou telemóvel..." 
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {clientes
                    .filter(c => 
                      c.nome?.toLowerCase().includes(searchClient.toLowerCase()) || 
                      c.email?.toLowerCase().includes(searchClient.toLowerCase()) ||
                      c.telemovel?.includes(searchClient)
                    )
                    .slice(0, 50)
                    .map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedClientId(c.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                          selectedClientId === c.id 
                            ? 'border-black bg-slate-50 ring-1 ring-black' 
                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold">{c.nome}</p>
                          <p className="text-[10px] text-slate-400">{c.email} {c.telemovel ? `• ${c.telemovel}` : ''}</p>
                        </div>
                        {selectedClientId === c.id && (
                          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        )}
                      </button>
                    ))}
                  {clientes.length > 0 && clientes.filter(c => c.nome?.toLowerCase().includes(searchClient.toLowerCase())).length === 0 && (
                    <p className="text-center py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum cliente encontrado</p>
                  )}
                </div>
                <input type="hidden" name="cliente_id" value={selectedClientId} />
                {!selectedClientId && !isNewClient && (
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Selecione um cliente da lista</p>
                )}
              </div>
            )}
          </section>

          <hr className="border-slate-100" />

          {/* 3. Viatura (Condicional ao Tipo) */}
          <section className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Informação da Viatura</p>
            
            {tipo === 'venda' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Viatura de Interesse (Stock)</label>
                <select name="carro_interesse_id" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-white">
                  <option value="">-- Selecione uma viatura disponível --</option>
                  {carros?.map(carro => (
                    <option key={carro.id} value={carro.id}>
                      {carro.marca} {carro.modelo} {carro.ano ? `(${carro.ano})` : ''} - {carro.preco ? `€${carro.preco}` : 'Preço sob consulta'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {tipo === 'compra' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <p className="text-sm font-bold text-slate-600 mb-4">Nova Viatura para Aquisição (Pipeline)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Marca</label>
                      <input name="acq_marca" value={newVehicle.marca} onChange={e => setNewVehicle({...newVehicle, marca: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ex: BMW" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Modelo</label>
                      <input name="acq_modelo" value={newVehicle.modelo} onChange={e => setNewVehicle({...newVehicle, modelo: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ex: Série 1" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Ano</label>
                      <input name="acq_ano" type="number" value={newVehicle.ano} onChange={e => setNewVehicle({...newVehicle, ano: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Matrícula</label>
                      <input name="acq_matricula" value={newVehicle.matricula} onChange={e => setNewVehicle({...newVehicle, matricula: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="00-AA-00" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Preço Aquisição (€)</label>
                      <input name="acq_preco_compra" type="number" value={newVehicle.preco_compra} onChange={e => setNewVehicle({...newVehicle, preco_compra: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm font-bold text-green-600" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">KM</label>
                      <input name="acq_km" type="number" value={newVehicle.km} onChange={e => setNewVehicle({...newVehicle, km: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tipo === 'contacto' && (
              <p className="text-sm text-slate-400 italic">Sem viatura específica associada.</p>
            )}
          </section>

          <hr className="border-slate-100" />

          {/* 4. Detalhes Adicionais */}
          <section className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Fonte / Origem</label>
              <select name="fonte" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-white">
                <option value="presencial">Presencial (Stand)</option>
                <option value="telefone">Telefone</option>
                <option value="email">E-mail Direto</option>
                <option value="website">Website Form</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="referencia">Referência / Recomendação</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Prioridade</label>
              <select name="prioridade" defaultValue="media" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-white">
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Vendedor Atribuído</label>
              <select name="vendedor_id" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-white">
                <option value="">— Ninguém (Pendente) —</option>
                {vendedores.map(v => (
                  <option key={v.user_id} value={v.user_id} selected={v.user_id === currentUserId}>{v.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Valor Estimado (€)</label>
              <input name="valor_estimado" type="number" step="0.01" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black" placeholder="Ex: 25000" />
            </div>
          </section>

          <section>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Mensagem / Observações</label>
            <textarea name="mensagem" rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none" placeholder="O que procura o cliente?" />
          </section>

          <div className="pt-4 flex justify-end gap-3">
            <Link href="/admin/leads" className="px-6 py-3 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors">
              Cancelar
            </Link>
            <button type="submit" className="px-10 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#e35a39] shadow-lg shadow-black/10 transition-all">
              Criar Lead
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
