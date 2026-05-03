'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  updateLeadStatus, updateLeadNotes, updateLeadPriority,
  assignLead, linkClienteToLead, closeLeadGanha, closeLeadPerdida,
  updateCliente, updateCarrosInteresse, updateDadosRetoma, updateValor,
  addNegotiationVehicle
} from '../actions'

const ESTADOS = [
  { id: 'nova', label: 'Nova', color: 'bg-blue-100 text-blue-700' },
  { id: 'em_contacto', label: 'Em Contacto', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'test_drive', label: 'Test Drive', color: 'bg-purple-100 text-purple-700' },
  { id: 'proposta', label: 'Proposta', color: 'bg-orange-100 text-orange-700' },
  { id: 'ganha', label: 'Ganha', color: 'bg-green-100 text-green-700' },
  { id: 'perdida', label: 'Perdida', color: 'bg-red-100 text-red-700' },
]

const PRIORIDADES = [
  { id: 'baixa', label: 'Baixa', color: 'bg-slate-100 text-slate-500' },
  { id: 'media', label: 'Média', color: 'bg-blue-100 text-blue-700' },
  { id: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  { id: 'urgente', label: 'Urgente', color: 'bg-red-100 text-red-700' },
]

const FONTE_ICONS: Record<string, string> = {
  website: '🌐', facebook: '📘', instagram: '📷', google: '🔍',
  referencia: '👥', telefone: '📞', presencial: '🚶', email: '✉️', outro: '📌',
}

const TIPO_ATIVIDADE_ICON: Record<string, string> = {
  estado: '🔄', prioridade: '⚡', nota: '📝', vendedor: '👤', criacao: '🟢', outro: '📌',
}

const tipoLabel: Record<string, string> = {
  contacto: 'Contacto', venda: 'Venda (Stand Vende)', test_drive: 'Test Drive', compra: 'Compra (Stand Compra)'
}

export function LeadDetailClient({
  lead, carroOriginal, carrosInteresse, interesseIds, todosCarros, vendedores, atividade, currentUserId,
}: {
  lead: any
  carroOriginal: any
  carrosInteresse: any[]
  interesseIds: string[]
  todosCarros: any[]
  vendedores: any[]
  atividade: any[]
  currentUserId: string
}) {
  const [estado, setEstado] = useState(lead.estado)
  const [prioridade, setPrioridade] = useState(lead.prioridade || 'media')
  const [vendedorId, setVendedorId] = useState(lead.vendedor_id || '')
  const [notas, setNotas] = useState(lead.notas_internas || '')
  const [savingNotas, setSavingNotas] = useState(false)
  const [notasSaved, setNotasSaved] = useState(false)
  const [linkingCliente, setLinkingCliente] = useState(false)

  // Modals
  const [modalGanha, setModalGanha] = useState(false)
  const [modalPerdida, setModalPerdida] = useState(false)
  
  // Ganha Form
  const defaultCarroId = carroOriginal?.id || (carrosInteresse.length > 0 ? carrosInteresse[0].id : '')
  const [valorTransacao, setValorTransacao] = useState<string>(lead.valor_transacao?.toString() || lead.valor_estimado?.toString() || '')
  const [ganhaVendedorId, setGanhaVendedorId] = useState(lead.vendedor_id || currentUserId)
  const [ganhaCarroId, setGanhaCarroId] = useState<string>(defaultCarroId)

  // Calcula margem bruta em tempo real (para mostrar no modal)
  const carroSelecionado = todosCarros.find(c => c.id === ganhaCarroId)
  const margemBruta = carroSelecionado?.preco_compra && valorTransacao
    ? Number(valorTransacao) - Number(carroSelecionado.preco_compra)
    : null
  
  // Perdida Form
  const [motivoPerda, setMotivoPerda] = useState(lead.motivo_perda || '')

  // Cliente Edit
  const [isEditingCliente, setIsEditingCliente] = useState(false)
  const cliente = lead.clientes
  const [clienteForm, setClienteForm] = useState({
    nome: cliente?.nome || lead.nome || '',
    email: cliente?.email || lead.email || '',
    telemovel: cliente?.telemovel || lead.telemovel || '',
    nif: cliente?.nif || '',
    data_nascimento: cliente?.data_nascimento || '',
    morada: cliente?.morada || '',
    cod_postal: cliente?.cod_postal || '',
    localidade: cliente?.localidade || '',
    notas_internas: cliente?.notas_internas || ''
  })
  const [savingCliente, setSavingCliente] = useState(false)

  // Retoma Edit
  const [isEditingRetoma, setIsEditingRetoma] = useState(false)
  const [retomaForm, setRetomaForm] = useState(lead.dados_retoma || { marca: '', modelo: '', ano: '', km: '', matricula: '', valor_retoma: '' })
  const [savingRetoma, setSavingRetoma] = useState(false)

  // Viaturas Interesse
  const [isAddingCar, setIsAddingCar] = useState(false)
  const [selectedCarId, setSelectedCarId] = useState('')
  const [savingCars, setSavingCars] = useState(false)

  // Valor Estimado Edit
  const [isEditingValor, setIsEditingValor] = useState(false)
  const [valorEdit, setValorEdit] = useState<string>(lead.valor_estimado?.toString() || '')
  const [savingValor, setSavingValor] = useState(false)

  // Novo Carro (Negociação) Modal
  const [modalNegociacao, setModalNegociacao] = useState(false)
  const [savingNegociacao, setSavingNegociacao] = useState(false)
  const [negociacaoForm, setNegociacaoForm] = useState({
    marca: '', modelo: '', ano: new Date().getFullYear().toString(),
    matricula: '', km: '', preco_compra: '', combustivel: 'diesel',
    transmissao: 'manual', cor: ''
  })

  const estadoConfig = ESTADOS.find(e => e.id === estado) || ESTADOS[0]
  const prioridadeConfig = PRIORIDADES.find(p => p.id === prioridade) || PRIORIDADES[1]

  async function handleEstadoChange(novoEstado: string) {
    if (novoEstado === 'ganha') {
      setModalGanha(true)
      return
    }
    if (novoEstado === 'perdida') {
      setModalPerdida(true)
      return
    }
    setEstado(novoEstado)
    await updateLeadStatus(lead.id, novoEstado)
  }

  async function saveValorEstimado(e: React.FormEvent) {
    e.preventDefault()
    setSavingValor(true)
    const valNum = parseFloat(valorEdit)
    await updateValor(lead.id, isNaN(valNum) ? null : valNum)
    setSavingValor(false)
    setIsEditingValor(false)
    window.location.reload()
  }

  async function submitGanha(e: React.FormEvent) {
    e.preventDefault()
    await closeLeadGanha(lead.id, Number(valorTransacao), ganhaVendedorId, ganhaCarroId || undefined)
    setEstado('ganha')
    setModalGanha(false)
  }

  async function submitPerdida(e: React.FormEvent) {
    e.preventDefault()
    if (!motivoPerda) return
    await closeLeadPerdida(lead.id, motivoPerda)
    setEstado('perdida')
    setModalPerdida(false)
  }

  async function handlePrioridade(novaPrioridade: string) {
    setPrioridade(novaPrioridade)
    await updateLeadPriority(lead.id, novaPrioridade)
  }

  async function handleVendedor(novoVendedorId: string) {
    setVendedorId(novoVendedorId)
    await assignLead(lead.id, novoVendedorId)
  }

  async function handleSaveNotas() {
    setSavingNotas(true)
    await updateLeadNotes(lead.id, notas)
    setSavingNotas(false)
    setNotasSaved(true)
    setTimeout(() => setNotasSaved(false), 2000)
  }

  async function handleLinkCliente() {
    setLinkingCliente(true)
    await linkClienteToLead(lead.id)
    setLinkingCliente(false)
    window.location.reload() // Reload to fetch new client data
  }

  async function saveCliente(e: React.FormEvent) {
    e.preventDefault()
    if (!cliente) return
    setSavingCliente(true)
    await updateCliente(cliente.id, lead.id, clienteForm)
    setSavingCliente(false)
    setIsEditingCliente(false)
    window.location.reload()
  }

  async function saveRetoma(e: React.FormEvent) {
    e.preventDefault()
    setSavingRetoma(true)
    await updateDadosRetoma(lead.id, retomaForm)
    setSavingRetoma(false)
    setIsEditingRetoma(false)
    window.location.reload()
  }

  async function removeRetoma() {
    if (!confirm('Remover viatura de retoma?')) return
    await updateDadosRetoma(lead.id, null)
    window.location.reload()
  }

  async function addCarroInteresse() {
    if (!selectedCarId) return
    if (interesseIds.includes(selectedCarId)) return setIsAddingCar(false)
    setSavingCars(true)
    await updateCarrosInteresse(lead.id, [...interesseIds, selectedCarId])
    setSavingCars(false)
    setIsAddingCar(false)
    window.location.reload()
  }

  async function removeCarroInteresse(carIdToRemove: string) {
    if (!confirm('Remover viatura de interesse?')) return
    await updateCarrosInteresse(lead.id, interesseIds.filter(id => id !== carIdToRemove))
    window.location.reload()
  }

  async function submitNegociacao(e: React.FormEvent) {
    e.preventDefault()
    setSavingNegociacao(true)
    const res = await addNegotiationVehicle(lead.id, {
      ...negociacaoForm,
      ano: parseInt(negociacaoForm.ano),
      km: parseInt(negociacaoForm.km) || 0,
      preco_compra: parseFloat(negociacaoForm.preco_compra) || 0,
      preco: (parseFloat(negociacaoForm.preco_compra) || 0) * 1.2, // Estimativa de venda +20%
    })
    setSavingNegociacao(false)
    if (res.error) {
      alert(res.error)
    } else {
      setModalNegociacao(false)
      window.location.reload()
    }
  }

  // Combine original car + added cars to display
  const displayCars = [...(carroOriginal && !interesseIds.includes(carroOriginal.id) ? [carroOriginal] : []), ...carrosInteresse]

  return (
    <div className="min-h-screen bg-[#f9f9f9] font-['Manrope'] text-[#1b1b1b]">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-100 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/leads" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <nav className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <Link href="/admin" className="hover:text-black transition-colors">Admin</Link>
              <span>/</span>
              <Link href="/admin/leads" className="hover:text-black transition-colors">Leads</Link>
              <span>/</span>
              <span className="text-black">{lead.nome || lead.email || 'Lead Detalhe'}</span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${estadoConfig.color}`}>{estadoConfig.label}</span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${prioridadeConfig.color}`}>{prioridadeConfig.label}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="col-span-8 space-y-6">

            {/* Contacto Header */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Informação de Contacto</p>
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-white text-xl font-black flex-shrink-0">
                  {(lead.nome || lead.email || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-black text-black tracking-tight mb-1">{lead.nome || '(Sem nome)'}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    {lead.email && <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 hover:text-black"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>{lead.email}</a>}
                    {lead.telemovel && <a href={`tel:${lead.telemovel}`} className="flex items-center gap-1.5 hover:text-black"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{lead.telemovel}</a>}
                    <span className="text-slate-400">{FONTE_ICONS[lead.fonte] || '📌'} {lead.fonte || 'website'}</span>
                    <span className="text-slate-400">{tipoLabel[lead.tipo] || lead.tipo}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Acções: Estado + Prioridade + Vendedor */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Estado</label>
                  <select value={estado} onChange={e => handleEstadoChange(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-black bg-white">
                    {ESTADOS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Prioridade</label>
                  <select value={prioridade} onChange={e => handlePrioridade(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-black bg-white">
                    {PRIORIDADES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Vendedor Atribuído</label>
                  <select value={vendedorId} onChange={e => handleVendedor(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-black bg-white">
                    <option value="">— Sem atribuição —</option>
                    {vendedores.map(v => <option key={v.user_id} value={v.user_id}>{v.isCurrentUser ? `${v.nome} (eu)` : v.nome}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Mensagem */}
            {lead.mensagem && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Mensagem do Cliente</p>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{lead.mensagem}</p>
              </div>
            )}

            {/* Viaturas de Interesse / Aquisição */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {lead.tipo === 'compra' ? 'Viaturas para Aquisição' : 'Viaturas de Interesse'}
                </p>
                {!isAddingCar && (
                  <div className="flex gap-4">
                    <button onClick={() => {
                      setNegociacaoForm({ ...negociacaoForm, marca: '', modelo: '' })
                      setModalNegociacao(true)
                    }} className="text-xs font-bold text-[#e35a39] hover:underline uppercase tracking-widest">
                      + Criar Nova Viatura (Aquisição)
                    </button>
                    <button onClick={() => setIsAddingCar(true)} className="text-xs font-bold text-slate-400 hover:underline uppercase tracking-widest">
                      + Associar Existente
                    </button>
                  </div>
                )}
              </div>

              {isAddingCar && (
                <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Selecione uma viatura</label>
                    <select value={selectedCarId} onChange={e => setSelectedCarId(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-black bg-white">
                      <option value="">— Selecione —</option>
                      {todosCarros.map(c => <option key={c.id} value={c.id}>{c.marca} {c.modelo} ({c.ano}) - {c.preco}€</option>)}
                    </select>
                  </div>
                  <button onClick={addCarroInteresse} disabled={savingCars || !selectedCarId} className="px-4 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#e35a39] disabled:bg-slate-300">
                    Adicionar
                  </button>
                  <button onClick={() => setIsAddingCar(false)} className="px-4 py-2.5 bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-slate-300">
                    Cancelar
                  </button>
                </div>
              )}

              {displayCars.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Nenhuma viatura associada.</p>
              ) : (
                <div className="space-y-3">
                  {displayCars.map(car => (
                    <div key={car.id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 relative group">
                      {car.imagens?.[0] ? <img src={car.imagens[0]} alt="" className="w-20 h-14 object-cover rounded-lg flex-shrink-0" /> : <div className="w-20 h-14 bg-slate-200 rounded-lg flex-shrink-0 flex items-center justify-center text-xl">🚗</div>}
                      <div className="flex-1">
                        <p className="font-black text-black">{car.marca} {car.modelo}</p>
                        <p className="text-sm text-slate-500">{car.ano} • {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(car.preco)}</p>
                      </div>
                      <Link href={`/carro/${car.id}`} target="_blank" className="text-xs font-bold text-slate-400 hover:text-black uppercase tracking-widest mr-2">Ver →</Link>
                      {car.id !== carroOriginal?.id && (
                        <button onClick={() => removeCarroInteresse(car.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity" title="Remover">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Retoma (Apenas se não for uma lead de venda direta, conforme solicitado) */}
            {lead.tipo !== 'venda' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Viatura de Retoma</p>
                  {!isEditingRetoma && !lead.dados_retoma && (
                    <div className="flex gap-4">
                      <button onClick={() => {
                        setNegociacaoForm({ 
                          marca: lead.dados_retoma?.marca || '', 
                          modelo: lead.dados_retoma?.modelo || '',
                          ano: lead.dados_retoma?.ano || new Date().getFullYear().toString(),
                          matricula: lead.dados_retoma?.matricula || '',
                          km: lead.dados_retoma?.km || '',
                          preco_compra: lead.dados_retoma?.valor_retoma || '',
                          combustivel: 'diesel', transmissao: 'manual', cor: ''
                        })
                        setModalNegociacao(true)
                      }} className="text-xs font-bold text-[#e35a39] hover:underline uppercase tracking-widest">
                        {lead.dados_retoma ? 'Mover para Aquisições' : '+ Adicionar Viatura (Aquisição)'}
                      </button>
                      {!lead.dados_retoma && (
                        <button onClick={() => setIsEditingRetoma(true)} className="text-xs font-bold text-slate-400 hover:underline uppercase tracking-widest">
                          + Registar Apenas Dados
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isEditingRetoma ? (
                  <form onSubmit={saveRetoma} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div><label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Marca</label><input required value={retomaForm.marca} onChange={e => setRetomaForm({...retomaForm, marca: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                      <div><label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Modelo</label><input required value={retomaForm.modelo} onChange={e => setRetomaForm({...retomaForm, modelo: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                      <div><label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Ano</label><input type="number" required value={retomaForm.ano} onChange={e => setRetomaForm({...retomaForm, ano: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                      <div><label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Matrícula</label><input value={retomaForm.matricula} onChange={e => setRetomaForm({...retomaForm, matricula: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                      <div><label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Quilómetros</label><input type="number" value={retomaForm.km} onChange={e => setRetomaForm({...retomaForm, km: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                      <div><label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Valor Retoma Esperado (€)</label><input type="number" value={retomaForm.valor_retoma} onChange={e => setRetomaForm({...retomaForm, valor_retoma: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={savingRetoma} className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#e35a39]">Guardar</button>
                      <button type="button" onClick={() => setIsEditingRetoma(false)} className="px-4 py-2 bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-lg">Cancelar</button>
                      {lead.dados_retoma && <button type="button" onClick={removeRetoma} className="ml-auto px-4 py-2 bg-red-100 text-red-600 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-red-200">Remover Retoma</button>}
                    </div>
                  </form>
                ) : lead.dados_retoma ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[['Marca', lead.dados_retoma.marca], ['Modelo', lead.dados_retoma.modelo], ['Ano', lead.dados_retoma.ano], ['Matrícula', lead.dados_retoma.matricula], ['KM', lead.dados_retoma.km], ['Valor', lead.dados_retoma.valor_retoma ? `€${lead.dados_retoma.valor_retoma}` : null]]
                      .filter(([, v]) => v).map(([l, v]) => (
                        <div key={l as string} className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{l as string}</p>
                          <p className="font-bold text-black">{v as string}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Sem retoma associada.</p>
                )}
              </div>
            )}

            {/* Notas Internas da Lead */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Notas da Lead</p>
              <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={4} placeholder="Notas da equipa comercial sobre esta oportunidade..." className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-slate-50 resize-none" />
              <button onClick={handleSaveNotas} disabled={savingNotas} className="mt-3 px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#e35a39] disabled:bg-slate-300">
                {notasSaved ? '✓ Guardado' : savingNotas ? 'A guardar...' : 'Guardar Notas'}
              </button>
            </div>

            {/* Actividade */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Actividade</p>
              <div className="space-y-4">
                {atividade.map(ev => (
                  <div key={ev.id} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{TIPO_ATIVIDADE_ICON[ev.tipo] || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">{ev.descricao}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">{new Date(ev.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        {ev.user_nome && <><span className="text-slate-300">·</span><span className="text-xs font-bold text-slate-500">{ev.user_nome}</span></>}
                      </div>
                      {ev.valor_anterior && ev.valor_novo && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded line-through">{ev.valor_anterior}</span>
                          <span className="text-xs text-slate-400">→</span>
                          <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded font-bold">{ev.valor_novo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="col-span-4 space-y-4">

            {/* Cliente */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Cliente</p>
                {cliente && !isEditingCliente && (
                  <button onClick={() => setIsEditingCliente(true)} className="text-xs font-bold text-slate-400 hover:text-black uppercase tracking-widest">
                    Editar
                  </button>
                )}
              </div>

              {cliente ? (
                isEditingCliente ? (
                  <form onSubmit={saveCliente} className="space-y-3">
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">Nome</label><input required value={clienteForm.nome} onChange={e => setClienteForm({...clienteForm, nome: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">E-mail</label><input value={clienteForm.email} onChange={e => setClienteForm({...clienteForm, email: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">Telemóvel</label><input value={clienteForm.telemovel} onChange={e => setClienteForm({...clienteForm, telemovel: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">NIF</label><input value={clienteForm.nif} onChange={e => setClienteForm({...clienteForm, nif: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">Data Nascimento</label><input type="date" value={clienteForm.data_nascimento} onChange={e => setClienteForm({...clienteForm, data_nascimento: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">Morada</label><input value={clienteForm.morada} onChange={e => setClienteForm({...clienteForm, morada: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="block text-xs font-bold text-slate-500 mb-1">Cód. Postal</label><input value={clienteForm.cod_postal} onChange={e => setClienteForm({...clienteForm, cod_postal: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                      <div><label className="block text-xs font-bold text-slate-500 mb-1">Localidade</label><input value={clienteForm.localidade} onChange={e => setClienteForm({...clienteForm, localidade: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                    </div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">Notas Cliente</label><textarea value={clienteForm.notas_internas} onChange={e => setClienteForm({...clienteForm, notas_internas: e.target.value})} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                    <div className="flex gap-2 pt-2">
                      <button type="submit" disabled={savingCliente} className="flex-1 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#e35a39]">Guardar</button>
                      <button type="button" onClick={() => setIsEditingCliente(false)} className="flex-1 py-2 bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-lg">Cancelar</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                        {(cliente.nome || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-black">{cliente.nome}</p>
                        <div className="flex gap-1 mt-0.5">
                          {cliente.tipo_cliente === 'vip' && <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⭐ VIP</span>}
                          {cliente.tipo_cliente === 'recorrente' && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">🔄 Recorrente</span>}
                          {(!cliente.tipo_cliente || cliente.tipo_cliente === 'prospect') && <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Prospect</span>}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600 mb-4">
                      {cliente.email && <p className="truncate text-xs"><span className="font-bold">E:</span> {cliente.email}</p>}
                      {cliente.telemovel && <p className="text-xs"><span className="font-bold">T:</span> {cliente.telemovel}</p>}
                      {cliente.nif && <p className="text-xs"><span className="font-bold">NIF:</span> {cliente.nif}</p>}
                      {cliente.localidade && <p className="text-xs"><span className="font-bold">Local:</span> {cliente.localidade}</p>}
                    </div>
                    <Link href={`/admin/clientes/${cliente.id}`} className="block text-center text-xs font-bold text-[#e35a39] hover:underline uppercase tracking-widest">
                      Ver Perfil Completo →
                    </Link>
                  </>
                )
              ) : (
                <>
                  <div className="mb-4 space-y-1 text-sm text-slate-600">
                    <p className="font-bold text-black">{lead.nome || '(Sem nome)'}</p>
                    {lead.email && <p className="text-xs">{lead.email}</p>}
                    {lead.telemovel && <p className="text-xs">{lead.telemovel}</p>}
                    <p className="text-xs text-amber-600 font-bold mt-2">⚠ Não ligado à base de clientes</p>
                  </div>
                  <button onClick={handleLinkCliente} disabled={linkingCliente} className="w-full text-xs font-bold bg-black text-white px-3 py-2 rounded-lg hover:bg-[#e35a39] disabled:bg-slate-300 uppercase tracking-widest">
                    {linkingCliente ? 'A criar...' : 'Criar / Ligar Cliente'}
                  </button>
                </>
              )}
            </div>

            {/* Valor */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {lead.estado === 'ganha' ? 'Valor da Transação' : lead.estado === 'proposta' ? 'Valor da Proposta' : 'Valor Estimado'}
                </p>
                {lead.estado !== 'ganha' && !isEditingValor && (
                  <button onClick={() => setIsEditingValor(true)} className="text-xs font-bold text-slate-400 hover:text-black uppercase tracking-widest">
                    Editar
                  </button>
                )}
              </div>
              
              {isEditingValor ? (
                <form onSubmit={saveValorEstimado} className="space-y-3 mt-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">€</span>
                    <input 
                      type="number" 
                      step="0.01"
                      value={valorEdit} 
                      onChange={e => setValorEdit(e.target.value)} 
                      className="w-full pl-8 pr-3 py-2 text-xl font-black border-b-2 border-black focus:outline-none focus:border-[#e35a39]"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={savingValor} className="flex-1 py-1.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#e35a39]">Guardar</button>
                    <button type="button" onClick={() => setIsEditingValor(false)} className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest rounded-lg">✕</button>
                  </div>
                </form>
              ) : lead.valor_transacao ? (
                <p className="text-3xl font-black text-green-600 tracking-tight">{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(lead.valor_transacao)}</p>
              ) : lead.valor_estimado ? (
                <p className="text-3xl font-black text-black tracking-tight">{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(lead.valor_estimado)}</p>
              ) : (
                <p className="text-2xl font-black text-slate-300">—</p>
              )}
            </div>

            {/* Motivo perda */}
            {estado === 'perdida' && (
              <div className="bg-red-50 rounded-2xl border border-red-100 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">Motivo de Perda</p>
                <p className="text-sm text-red-700">{lead.motivo_perda || 'Não especificado'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {modalGanha && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-black text-green-600 mb-1">
              {lead.tipo === 'compra' ? '📦 Aquisição Concluída!' : '🏆 Negócio Fechado!'}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {lead.tipo === 'compra' 
                ? 'Registe o valor final pago pela viatura para integrá-la no stock.' 
                : 'Registe os dados finais da transação para calcular margem e comissão.'}
            </p>
            <form onSubmit={submitGanha} className="space-y-4">
              {/* Viatura Vendida */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Viatura Vendida</label>
                <select
                  value={ganhaCarroId}
                  onChange={e => setGanhaCarroId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold focus:border-green-500 focus:outline-none"
                >
                  <option value="">— Sem viatura específica —</option>
                  {todosCarros.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.marca} {c.modelo} ({c.ano}) — {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(c.preco)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Valor Final */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  {lead.tipo === 'compra' ? 'Valor Pago pela Viatura (€)' : 'Valor Final da Venda (€)'}
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={valorTransacao}
                  onChange={e => setValorTransacao(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 font-bold text-lg focus:border-green-500 focus:outline-none"
                />
              </div>

              {/* Painel de Margem + Comissão (real-time) */}
              {lead.tipo !== 'compra' && margemBruta !== null && (
                <div className={`rounded-xl p-4 border ${
                  margemBruta >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço Compra</p>
                      <p className="text-sm font-bold text-slate-600">
                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(carroSelecionado?.preco_compra)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Margem Bruta</p>
                      <p className={`text-sm font-black ${ margemBruta >= 0 ? 'text-green-700' : 'text-red-700' }`}>
                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(margemBruta)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Vendedor */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Vendedor Responsável</label>
                <select
                  required
                  value={ganhaVendedorId}
                  onChange={e => setGanhaVendedorId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:border-green-500 focus:outline-none"
                >
                  {vendedores.map(v => <option key={v.user_id} value={v.user_id}>{v.nome}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 uppercase tracking-widest text-sm">
                  {lead.tipo === 'compra' ? 'Confirmar Aquisição' : 'Confirmar Venda'}
                </button>
                <button type="button" onClick={() => { setModalGanha(false); setEstado(lead.estado) }} className="px-6 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 uppercase tracking-widest text-sm">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Perdida */}
      {modalPerdida && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-black text-red-600 mb-2">❌ Negócio Perdido</h2>
            <p className="text-sm text-slate-500 mb-6">Por favor indique o motivo para fins de análise e estatística.</p>
            <form onSubmit={submitPerdida} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Motivo / Explicação</label>
                <textarea required rows={4} placeholder="Ex: Cliente achou caro, comprou noutro stand, não conseguiu crédito..." value={motivoPerda} onChange={e => setMotivoPerda(e.target.value)} className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:border-red-500 focus:outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 uppercase tracking-widest text-sm">Registar Perda</button>
                <button type="button" onClick={() => { setModalPerdida(false); setEstado(lead.estado) }} className="px-6 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 uppercase tracking-widest text-sm">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: Nova Viatura (Aquisição) */}
      {modalNegociacao && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-black mb-1">📦 Nova Viatura para Aquisição</h2>
            <p className="text-sm text-slate-500 mb-6">Esta viatura será adicionada à página de <strong>Aquisições</strong> em estado de negociação.</p>
            
            <form onSubmit={submitNegociacao} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Marca</label>
                  <input required value={negociacaoForm.marca} onChange={e => setNegociacaoForm({...negociacaoForm, marca: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-black focus:outline-none" placeholder="Ex: BMW" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Modelo</label>
                  <input required value={negociacaoForm.modelo} onChange={e => setNegociacaoForm({...negociacaoForm, modelo: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-black focus:outline-none" placeholder="Ex: Série 1" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Ano</label>
                  <input required type="number" value={negociacaoForm.ano} onChange={e => setNegociacaoForm({...negociacaoForm, ano: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-black focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Matrícula</label>
                  <input value={negociacaoForm.matricula} onChange={e => setNegociacaoForm({...negociacaoForm, matricula: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-black focus:outline-none" placeholder="00-AA-00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Quilómetros</label>
                  <input type="number" value={negociacaoForm.km} onChange={e => setNegociacaoForm({...negociacaoForm, km: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-black focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Preço de Aquisição (€)</label>
                  <input required type="number" step="0.01" value={negociacaoForm.preco_compra} onChange={e => setNegociacaoForm({...negociacaoForm, preco_compra: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-green-600 focus:border-black focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Combustível</label>
                  <select value={negociacaoForm.combustivel} onChange={e => setNegociacaoForm({...negociacaoForm, combustivel: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-black focus:outline-none">
                    <option value="diesel">Diesel</option>
                    <option value="gasolina">Gasolina</option>
                    <option value="eletrico">Elétrico</option>
                    <option value="hibrido">Híbrido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Transmissão</label>
                  <select value={negociacaoForm.transmissao} onChange={e => setNegociacaoForm({...negociacaoForm, transmissao: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-black focus:outline-none">
                    <option value="manual">Manual</option>
                    <option value="automatico">Automático</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={savingNegociacao} className="flex-1 bg-black text-white font-bold py-3 rounded-xl hover:bg-[#e35a39] uppercase tracking-widest text-sm disabled:bg-slate-300">
                  {savingNegociacao ? 'A criar...' : 'Criar Viatura e Iniciar Aquisição'}
                </button>
                <button type="button" onClick={() => setModalNegociacao(false)} className="px-6 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 uppercase tracking-widest text-sm">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
