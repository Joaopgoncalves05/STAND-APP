'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCliente } from '../actions'

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
  nova: { label: 'Nova', color: 'bg-blue-100 text-blue-700' },
  em_contacto: { label: 'Em Contacto', color: 'bg-yellow-100 text-yellow-700' },
  test_drive: { label: 'Test Drive', color: 'bg-purple-100 text-purple-700' },
  proposta: { label: 'Proposta', color: 'bg-orange-100 text-orange-700' },
  ganha: { label: 'Ganha', color: 'bg-green-100 text-green-700' },
  perdida: { label: 'Perdida', color: 'bg-red-100 text-red-700' },
}

const TIPO_CLIENTE_CONFIG: Record<string, { label: string; color: string }> = {
  prospect: { label: 'Prospect', color: 'bg-slate-100 text-slate-500' },
  recorrente: { label: 'Recorrente', color: 'bg-green-100 text-green-700' },
  vip: { label: 'VIP', color: 'bg-yellow-100 text-yellow-700' },
  inativo: { label: 'Inativo', color: 'bg-red-100 text-red-500' },
}

interface ClienteDetailClientProps {
  cliente: any
  leads: any[]
}

export function ClienteDetailClient({ cliente, leads }: ClienteDetailClientProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    nome: cliente.nome || '',
    email: cliente.email || '',
    telemovel: cliente.telemovel || '',
    nif: cliente.nif || '',
    data_nascimento: cliente.data_nascimento || '',
    localidade: cliente.localidade || '',
    cod_postal: cliente.cod_postal || cliente.codigo_postal || '',
    canal_origem: cliente.canal_origem || '',
    morada: cliente.morada || '',
    consentimento_marketing: cliente.consentimento_marketing || false,
    notas_internas: cliente.notas_internas || '',
    orcamento_min: cliente.orcamento_min || '',
    orcamento_max: cliente.orcamento_max || '',
    tipo_cliente: cliente.tipo_cliente || 'prospect',
    veiculo_atual: cliente.veiculo_atual || { marca: '', modelo: '', ano: '', matricula: '', km: '' },
    preferencias: cliente.preferencias || { carrocaria: '', combustivel: '' }
  })

  const tipoConfig = TIPO_CLIENTE_CONFIG[formData.tipo_cliente || 'prospect']
  const leadsGanhas = leads.filter(l => l.estado === 'ganha')
  const valorTotal = leadsGanhas.reduce((acc: number, l: any) => acc + (l.valor_estimado || 0), 0)
  const tags: string[] = cliente.tags || []

  const handleSave = async () => {
    setIsSaving(true)
    const res = await updateCliente(cliente.id, formData)
    setIsSaving(false)
    if (res.success) {
      setIsEditing(false)
      router.refresh()
    } else {
      alert('Erro ao atualizar cliente.')
    }
  }

  // Helper inputs
  const inputClass = "w-full text-sm font-bold text-black border-b border-slate-200 focus:border-[#e35a39] outline-none bg-transparent py-1 transition-colors"

  return (
    <div className="min-h-screen bg-[#f9f9f9] font-['Manrope'] text-[#1b1b1b]">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-100 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/clientes" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <nav className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <Link href="/admin" className="hover:text-black transition-colors">Admin</Link>
              <span>/</span>
              <Link href="/admin/clientes" className="hover:text-black transition-colors">Clientes</Link>
              <span>/</span>
              <span className="text-black">{cliente.nome}</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="text-sm font-bold text-slate-500 hover:text-black transition-colors">Cancelar</button>
                <button onClick={handleSave} disabled={isSaving} className="text-sm font-bold bg-[#e35a39] text-white px-5 py-2 rounded-lg hover:bg-black transition-colors">
                  {isSaving ? 'A guardar...' : 'Guardar Alterações'}
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-bold bg-black text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Editar Perfil
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">

        {/* Identity Header */}
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-6 flex-1">
            <div className="w-24 h-24 rounded-full bg-cover bg-center border border-slate-200 flex-shrink-0" style={{ backgroundImage: "url('https://api.dicebear.com/9.x/notionists/svg?seed=" + (formData.nome || 'C') + "')" }}></div>
            <div className="flex-1 w-full max-w-sm">
              {isEditing ? (
                <>
                  <input type="text" className="w-full text-2xl font-black text-black tracking-tight border-b-2 border-slate-200 focus:border-[#e35a39] outline-none bg-transparent mb-2" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Nome do Cliente" />
                  <select className="text-sm font-bold text-[#e35a39] uppercase tracking-widest border-b border-slate-200 outline-none bg-transparent" value={formData.tipo_cliente} onChange={e => setFormData({...formData, tipo_cliente: e.target.value})}>
                    <option value="prospect">PROSPECT</option>
                    <option value="recorrente">RECORRENTE</option>
                    <option value="vip">VIP</option>
                    <option value="inativo">INATIVO</option>
                  </select>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-black text-black tracking-tight">{cliente.nome}</h1>
                  <p className="text-sm font-bold text-[#e35a39] uppercase tracking-widest mt-1">{tipoConfig.label} | Cliente ID: {cliente.id.substring(0, 8)}</p>
                </>
              )}
            </div>
          </div>
          
          <div className="flex gap-12 border-l border-slate-100 pl-8 w-full md:w-auto">
            <div className="space-y-4 w-48">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NIF</span>
                {isEditing ? <input type="text" className={inputClass} value={formData.nif} onChange={e => setFormData({...formData, nif: e.target.value})} /> : <span className="text-sm font-bold text-black">{formData.nif || '—'}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Desde</span>
                <span className="text-sm font-bold text-black">{cliente.created_at ? new Date(cliente.created_at).toLocaleDateString('pt-PT') : '—'}</span>
              </div>
            </div>
            <div className="space-y-4 w-48">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Telemóvel</span>
                {isEditing ? <input type="text" className={inputClass} value={formData.telemovel} onChange={e => setFormData({...formData, telemovel: e.target.value})} /> : <span className="text-sm font-bold text-black">{formData.telemovel || '—'}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-mail</span>
                {isEditing ? <input type="email" className={inputClass} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /> : <span className="text-sm font-bold text-black">{formData.email || '—'}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT: Personal Information */}
          <div className="col-span-12 md:col-span-6 space-y-6">
            <div className={`bg-white rounded-2xl border ${isEditing ? 'border-[#e35a39]/30 ring-4 ring-[#e35a39]/5' : 'border-slate-100'} p-8 shadow-sm transition-all duration-300`}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Informação Pessoal</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-black transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Data de Nascimento</p>
                  {isEditing ? <input type="date" className={inputClass} value={formData.data_nascimento} onChange={e => setFormData({...formData, data_nascimento: e.target.value})} /> : <p className="text-sm font-bold text-black">{formData.data_nascimento ? new Date(formData.data_nascimento).toLocaleDateString('pt-PT') : '—'}</p>}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Localidade / Origem</p>
                  {isEditing ? <input type="text" className={inputClass} value={formData.localidade} onChange={e => setFormData({...formData, localidade: e.target.value})} /> : <p className="text-sm font-bold text-black">{formData.localidade || '—'}</p>}
                </div>
                
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Código Postal</p>
                  {isEditing ? <input type="text" className={inputClass} value={formData.cod_postal} onChange={e => setFormData({...formData, cod_postal: e.target.value})} /> : <p className="text-sm font-bold text-black">{formData.cod_postal || '—'}</p>}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Canal de Aquisição</p>
                  {isEditing ? (
                    <select className={inputClass} value={formData.canal_origem} onChange={e => setFormData({...formData, canal_origem: e.target.value})}>
                      <option value="">(Não definido)</option>
                      <option value="stand">Stand Físico</option>
                      <option value="website">Website</option>
                      <option value="standvirtual">Standvirtual</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="recomendacao">Recomendação</option>
                    </select>
                  ) : <p className="text-sm font-bold text-black capitalize">{formData.canal_origem || '—'}</p>}
                </div>

                <div className="col-span-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Morada Faturação / Residência</p>
                  {isEditing ? <input type="text" className={inputClass} value={formData.morada} onChange={e => setFormData({...formData, morada: e.target.value})} /> : <p className="text-sm font-bold text-black">{formData.morada || 'Sem morada registada.'}</p>}
                </div>
                
                <div className="col-span-2 flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Consentimento Marketing (RGPD)</p>
                    <p className={`text-xs font-bold ${formData.consentimento_marketing ? 'text-green-600' : 'text-red-600'}`}>{formData.consentimento_marketing ? 'Sim, o cliente autoriza.' : 'Não autorizado.'}</p>
                  </div>
                  {isEditing && (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={formData.consentimento_marketing} onChange={e => setFormData({...formData, consentimento_marketing: e.target.checked})} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  )}
                </div>
              </div>
            </div>
            
            {/* Notas Internas */}
            <div className={`bg-white rounded-2xl border ${isEditing ? 'border-[#e35a39]/30 ring-4 ring-[#e35a39]/5' : 'border-slate-100'} p-8 shadow-sm transition-all duration-300`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Notas Internas</h2>
              </div>
              {isEditing ? (
                <textarea 
                  className="w-full h-32 text-sm text-black border border-slate-200 rounded-xl p-4 focus:border-[#e35a39] outline-none bg-slate-50 transition-colors resize-none"
                  value={formData.notas_internas}
                  onChange={e => setFormData({...formData, notas_internas: e.target.value})}
                  placeholder="Escreva aqui observações sobre o cliente..."
                />
              ) : (
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{formData.notas_internas || 'Nenhuma nota interna registada para este cliente.'}</p>
              )}
            </div>
          </div>

          {/* RIGHT: Preferences & History */}
          <div className="col-span-12 md:col-span-6 space-y-6">
            
            {/* Preferências */}
            <div className={`bg-white rounded-2xl border ${isEditing ? 'border-[#e35a39]/30 ring-4 ring-[#e35a39]/5' : 'border-slate-100'} p-8 shadow-sm transition-all duration-300`}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Informações de Compra & Preferências</h2>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Orçamento Mínimo</p>
                  {isEditing ? <input type="number" className={inputClass} value={formData.orcamento_min} onChange={e => setFormData({...formData, orcamento_min: e.target.value})} /> : <p className="text-sm font-bold text-black">{formData.orcamento_min ? new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(formData.orcamento_min)) : '—'}</p>}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Orçamento Máximo</p>
                  {isEditing ? <input type="number" className={inputClass} value={formData.orcamento_max} onChange={e => setFormData({...formData, orcamento_max: e.target.value})} /> : <p className="text-sm font-bold text-black">{formData.orcamento_max ? new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(formData.orcamento_max)) : '—'}</p>}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Carroçaria Preferencial</p>
                  {isEditing ? <input type="text" className={inputClass} value={formData.preferencias.carrocaria} onChange={e => setFormData({...formData, preferencias: {...formData.preferencias, carrocaria: e.target.value}})} placeholder="Ex: SUV, Sedan" /> : <p className="text-sm font-bold text-black">{formData.preferencias.carrocaria || '—'}</p>}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Combustível</p>
                  {isEditing ? <input type="text" className={inputClass} value={formData.preferencias.combustivel} onChange={e => setFormData({...formData, preferencias: {...formData.preferencias, combustivel: e.target.value}})} placeholder="Ex: Diesel, Elétrico" /> : <p className="text-sm font-bold text-black">{formData.preferencias.combustivel || '—'}</p>}
                </div>
              </div>
            </div>

            {/* Veículo Atual */}
            <div className={`bg-white rounded-2xl border ${isEditing ? 'border-[#e35a39]/30 ring-4 ring-[#e35a39]/5' : 'border-slate-100'} p-8 shadow-sm transition-all duration-300`}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Veículo de Retoma / Atual</h2>
              </div>
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                <div className="col-span-2 md:col-span-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Marca</p>
                  {isEditing ? <input type="text" className={inputClass} value={formData.veiculo_atual?.marca} onChange={e => setFormData({...formData, veiculo_atual: {...formData.veiculo_atual, marca: e.target.value}})} /> : <p className="text-sm font-bold text-black">{formData.veiculo_atual?.marca || '—'}</p>}
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Modelo</p>
                  {isEditing ? <input type="text" className={inputClass} value={formData.veiculo_atual?.modelo} onChange={e => setFormData({...formData, veiculo_atual: {...formData.veiculo_atual, modelo: e.target.value}})} /> : <p className="text-sm font-bold text-black">{formData.veiculo_atual?.modelo || '—'}</p>}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Ano</p>
                  {isEditing ? <input type="text" className={inputClass} value={formData.veiculo_atual?.ano} onChange={e => setFormData({...formData, veiculo_atual: {...formData.veiculo_atual, ano: e.target.value}})} /> : <p className="text-sm font-bold text-black">{formData.veiculo_atual?.ano || '—'}</p>}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Matrícula</p>
                  {isEditing ? <input type="text" className={inputClass} value={formData.veiculo_atual?.matricula} onChange={e => setFormData({...formData, veiculo_atual: {...formData.veiculo_atual, matricula: e.target.value}})} /> : <p className="text-sm font-bold text-black">{formData.veiculo_atual?.matricula || '—'}</p>}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Quilómetros</p>
                  {isEditing ? <input type="number" className={inputClass} value={formData.veiculo_atual?.km} onChange={e => setFormData({...formData, veiculo_atual: {...formData.veiculo_atual, km: e.target.value}})} /> : <p className="text-sm font-bold text-black">{formData.veiculo_atual?.km ? `${formData.veiculo_atual.km} km` : '—'}</p>}
                </div>
              </div>
            </div>

            {/* Leads History */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Histórico de Leads</h2>
                <div className="flex items-center gap-4 text-sm font-bold">
                  <span className="text-black">{leads.length} leads no total</span>
                  <span className="text-[#e35a39]">({leadsGanhas.length} ganhas)</span>
                </div>
              </div>
              {leads.length === 0 ? (
                <div className="px-8 py-10 text-center text-slate-400 text-sm">Nenhuma lead associada</div>
              ) : (
                <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                  {leads.map(lead => {
                    const estadoConf = ESTADO_CONFIG[lead.estado] || ESTADO_CONFIG.nova
                    return (
                      <Link href={`/admin/leads/${lead.id}`} key={lead.id} className="block px-8 py-4 hover:bg-slate-50 transition-colors group">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${estadoConf.color}`}>
                              {estadoConf.label}
                            </span>
                            <span className="text-xs font-bold text-slate-400">{new Date(lead.created_at).toLocaleDateString('pt-PT')}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-black">{lead.dados_viatura ? `${lead.dados_viatura.marca} ${lead.dados_viatura.modelo}` : 'Lead Geral'}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-black text-black">
                                {lead.valor_estimado ? new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(lead.valor_estimado) : '—'}
                              </span>
                              <svg className="w-4 h-4 text-slate-300 group-hover:text-[#e35a39] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
