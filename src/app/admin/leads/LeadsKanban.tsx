'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { updateLeadStatus, closeLeadGanha, closeLeadPerdida } from './actions'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

const COLUMNS = [
  { id: 'nova', label: 'Nova', color: 'bg-blue-500', border: 'border-blue-200', bg: 'bg-blue-50/60' },
  { id: 'em_contacto', label: 'Em Contacto', color: 'bg-yellow-500', border: 'border-yellow-200', bg: 'bg-yellow-50/60' },
  { id: 'test_drive', label: 'Test Drive', color: 'bg-purple-500', border: 'border-purple-200', bg: 'bg-purple-50/60' },
  { id: 'proposta', label: 'Proposta', color: 'bg-orange-500', border: 'border-orange-200', bg: 'bg-orange-50/60' },
  { id: 'ganha', label: 'Ganha 🏆', color: 'bg-green-500', border: 'border-green-200', bg: 'bg-green-50/60' },
  { id: 'perdida', label: 'Perdida', color: 'bg-red-500', border: 'border-red-200', bg: 'bg-red-50/60' },
]

const PRIORIDADE_CONFIG: Record<string, { label: string; color: string }> = {
  urgente: { label: 'Urgente', color: 'bg-red-100 text-red-700 ring-1 ring-red-300' },
  alta: { label: 'Alta', color: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200' },
  media: { label: 'Média', color: 'bg-blue-100 text-blue-700' },
  baixa: { label: 'Baixa', color: 'bg-slate-100 text-slate-500' },
}

const FONTE_ICONS: Record<string, string> = {
  website: '🌐',
  facebook: '📘',
  instagram: '📷',
  google: '🔍',
  referencia: '👥',
  telefone: '📞',
  presencial: '🚶',
  email: '✉️',
  outro: '📌',
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function getDaysSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function formatPhone(tel: string): string {
  // Remove spaces/dashes and ensure it's numeric-ish
  return tel.replace(/[\s\-()]/g, '')
}

// ────────────────────────────────────────────────────────────
// Lead Card Component (Draggable)
// ────────────────────────────────────────────────────────────

function LeadCard({ lead, isOverlay = false }: { lead: any; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging && !isOverlay ? 0.3 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  const prioridade = PRIORIDADE_CONFIG[lead.prioridade] || PRIORIDADE_CONFIG.media
  const fonteIcon = FONTE_ICONS[lead.fonte] || '📌'
  const cliente = lead.clientes

  // Stale lead detection
  const daysSince = getDaysSince(lead.ultimo_contacto || lead.created_at)
  const isStale = daysSince !== null && daysSince >= 2 && lead.estado !== 'ganha' && lead.estado !== 'perdida'

  const tel = lead.telemovel || cliente?.telemovel
  const email = lead.email || cliente?.email

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative bg-white rounded-xl border shadow-sm
        transition-shadow select-none
        ${isOverlay ? 'shadow-2xl rotate-2 border-slate-300 ring-2 ring-blue-400/40' : 'border-slate-100 hover:shadow-md hover:border-slate-200'}
        ${isStale ? 'border-l-2 border-l-amber-400' : ''}
      `}
    >
      {/* Stale badge */}
      {isStale && (
        <div className="absolute -top-2 -right-2 bg-amber-400 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm z-10">
          ⏰ {daysSince}d
        </div>
      )}

      <Link
        href={`/admin/leads/${lead.id}`}
        className="block p-4"
        onClick={(e) => {
          // Don't navigate if we're dragging
          if (isDragging) e.preventDefault()
        }}
        draggable={false}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 bg-slate-100 rounded text-slate-500">
              {lead.tipo}
            </span>
            <span title={`Fonte: ${lead.fonte}`} className="text-sm">{fonteIcon}</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${prioridade.color}`}>
            {prioridade.label}
          </span>
        </div>

        {/* Name */}
        <h4 className="font-bold text-slate-900 mb-0.5 truncate">{lead.nome || lead.email || 'Sem nome'}</h4>

        {/* VIP/Recorrente badge */}
        {cliente && (
          <div className="flex items-center gap-1 mb-2">
            {cliente.tipo_cliente === 'recorrente' && (
              <span className="text-[10px] text-slate-400">🔄 Recorrente</span>
            )}
            {cliente.tipo_cliente === 'vip' && (
              <span className="text-[10px] text-amber-600 font-bold">⭐ VIP</span>
            )}
          </div>
        )}

        {/* Message preview */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
          {lead.mensagem || (lead.dados_viatura
            ? `${lead.dados_viatura.marca} ${lead.dados_viatura.modelo} (${lead.dados_viatura.ano})`
            : 'Sem mensagem')}
        </p>

        {/* Photo count */}
        {lead.dados_viatura?.fotos?.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded w-fit mb-3">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {lead.dados_viatura.fotos.length} fotos
          </div>
        )}

        {/* Footer: date */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <span className="text-[10px] text-slate-400">
            {new Date(lead.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
          </span>
          {lead.valor_estimado && (
            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(lead.valor_estimado)}
            </span>
          )}
        </div>
      </Link>

      {/* Quick Action Buttons — sit outside the Link to avoid nested <a> */}
      {(tel || email) && (
        <div
          className="flex items-center gap-1 px-4 pb-3 -mt-1"
          onClick={(e) => e.stopPropagation()}
          // Prevent drag from triggering when clicking action buttons
          onPointerDown={(e) => e.stopPropagation()}
        >
          {tel && (
            <a
              href={`tel:${formatPhone(tel)}`}
              title={`Ligar para ${tel}`}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Ligar
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              title={`Email para ${email}`}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
          )}
          {tel && (
            <a
              href={`https://wa.me/351${formatPhone(tel)}`}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
              className="flex items-center justify-center w-9 h-7 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Droppable Column
// ────────────────────────────────────────────────────────────

function DroppableColumn({
  col,
  leads,
  isOver,
}: {
  col: typeof COLUMNS[0]
  leads: any[]
  isOver: boolean
}) {
  const { setNodeRef } = useDroppable({ id: col.id })

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-shrink-0 w-72 rounded-2xl flex flex-col border transition-colors duration-150
        ${isOver ? `${col.bg} ${col.border} border-2` : 'bg-slate-50 border-slate-100 border'}
      `}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${col.color}`} />
          {col.label}
        </h3>
        <span className="text-xs font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-3 min-h-[120px]">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
        {leads.length === 0 && (
          <div className={`
            flex items-center justify-center h-20 rounded-xl border-2 border-dashed text-[10px] font-bold uppercase tracking-widest transition-colors
            ${isOver ? `${col.border} text-slate-400` : 'border-slate-200 text-slate-300'}
          `}>
            {isOver ? 'Largar aqui' : 'Sem leads'}
          </div>
        )}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Main Kanban Export
// ────────────────────────────────────────────────────────────

export function LeadsKanban({ 
  initialLeads, 
  sellers, 
  todosCarros,
  currentUserId 
}: { 
  initialLeads: any[]
  sellers: any[]
  todosCarros: any[]
  currentUserId?: string 
}) {
  const [leads, setLeads] = useState(initialLeads)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overColumnId, setOverColumnId] = useState<string | null>(null)
  
  // Modals state
  const [modalGanha, setModalGanha] = useState(false)
  const [modalPerdida, setModalPerdida] = useState(false)
  const [targetLeadId, setTargetLeadId] = useState<string | null>(null)
  
  // Ganha form state
  const [valorTransacao, setValorTransacao] = useState('')
  const [ganhaVendedorId, setGanhaVendedorId] = useState(currentUserId || '')
  const [ganhaCarroId, setGanhaCarroId] = useState('')
  
  // Perdida form state
  const [motivoPerda, setMotivoPerda] = useState('')

  const router = useRouter()
  const supabase = createClient()


  // Sync with server-side props
  useEffect(() => {
    setLeads(initialLeads)
  }, [initialLeads])

  // Real-time: refresh on any DB change
  useEffect(() => {
    const channel = supabase
      .channel('leads-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        router.refresh()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, router])

  // DnD Sensors — require 8px movement before drag starts (prevents accidental drags on click)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragOver(event: DragOverEvent) {
    const over = event.over
    if (over) {
      // The droppable id is the column id (e.g., 'nova', 'em_contacto')
      const columnIds = COLUMNS.map((c) => c.id)
      const targetId = over.id as string
      if (columnIds.includes(targetId)) {
        setOverColumnId(targetId)
      } else {
        // Dragging over another card — find which column it belongs to
        const targetLead = leads.find((l) => l.id === targetId)
        if (targetLead) setOverColumnId(targetLead.estado)
      }
    } else {
      setOverColumnId(null)
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    setOverColumnId(null)

    if (!over) return

    const leadId = active.id as string
    const columnIds = COLUMNS.map((c) => c.id)

    // Determine the target column
    let targetColumn: string | null = null
    if (columnIds.includes(over.id as string)) {
      targetColumn = over.id as string
    } else {
      // Dropped on a card — use that card's column
      const overLead = leads.find((l) => l.id === over.id)
      if (overLead) targetColumn = overLead.estado
    }

    if (!targetColumn) return

    const draggedLead = leads.find((l) => l.id === leadId)
    if (!draggedLead || draggedLead.estado === targetColumn) return

    // Guard: ganha/perdida requires modal
    if (targetColumn === 'ganha') {
      const lead = leads.find(l => l.id === leadId)
      setTargetLeadId(leadId)
      setValorTransacao(lead?.valor_estimado?.toString() || '')
      setGanhaVendedorId(lead?.vendedor_id || currentUserId || '')
      setGanhaCarroId(lead?.carro_id || '')
      setModalGanha(true)
      return
    }

    if (targetColumn === 'perdida') {
      setTargetLeadId(leadId)
      setMotivoPerda('')
      setModalPerdida(true)
      return
    }


    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, estado: targetColumn! } : l)),
    )

    await updateLeadStatus(leadId, targetColumn)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Hint text */}
      <p className="text-xs text-slate-400 mb-4 select-none">
        💡 Arrasta os cards entre colunas para mover leads no funil
      </p>

      <div className="flex gap-4 overflow-x-auto pb-8 min-h-[70vh]">
        {COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => l.estado === col.id)
          return (
            <DroppableColumn
              key={col.id}
              col={col}
              leads={colLeads}
              isOver={overColumnId === col.id}
            />
          )
        })}
      </div>

      {/* Drag Overlay — shows a "ghost" card following the cursor */}
      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeLead ? <LeadCard lead={activeLead} isOverlay /> : null}
      </DragOverlay>

      {/* MODAL: Ganha */}
      {modalGanha && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
            {(() => {
              const lead = leads.find(l => l.id === targetLeadId)
              const isCompra = lead?.tipo === 'compra'
              return (
                <>
                  <h2 className="text-2xl font-black text-green-600 mb-1">
                    {isCompra ? '📦 Aquisição Concluída!' : '🏆 Negócio Fechado!'}
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    {isCompra 
                      ? 'Registe o valor final pago pela viatura para integrá-la no stock.' 
                      : 'Registe os dados finais da transação para calcular margem e comissão.'}
                  </p>
                  
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    if (!targetLeadId) return
                    await closeLeadGanha(targetLeadId, Number(valorTransacao), ganhaVendedorId, ganhaCarroId || undefined)
                    setModalGanha(false)
                    router.refresh()
                  }} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Viatura</label>
                      <select
                        value={ganhaCarroId}
                        onChange={e => setGanhaCarroId(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-green-500 focus:outline-none"
                      >
                        <option value="">— Selecione a viatura —</option>
                        {todosCarros.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.marca} {c.modelo} ({c.ano}) — {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(c.preco)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                        {isCompra ? 'Valor Pago pela Viatura (€)' : 'Valor Final da Venda (€)'}
                      </label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={valorTransacao}
                        onChange={e => setValorTransacao(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 font-bold text-lg focus:border-green-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Vendedor Responsável</label>
                      <select
                        required
                        value={ganhaVendedorId}
                        onChange={e => setGanhaVendedorId(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-green-500 focus:outline-none"
                      >
                        {sellers.map(s => <option key={s.user_id} value={s.user_id}>{s.nome || s.user_id}</option>)}
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button type="submit" className="flex-1 bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95">
                        {isCompra ? 'Confirmar Aquisição' : 'Confirmar Venda'}
                      </button>
                      <button type="button" onClick={() => setModalGanha(false)} className="px-6 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 uppercase tracking-widest text-xs transition-all">Cancelar</button>
                    </div>
                  </form>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* MODAL: Perdida */}
      {modalPerdida && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-red-600 mb-1">❌ Negócio Perdido</h2>
            <p className="text-sm text-slate-500 mb-6">Por favor, indique o motivo para podermos melhorar o nosso serviço.</p>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              if (!targetLeadId) return
              await closeLeadPerdida(targetLeadId, motivoPerda)
              setModalPerdida(false)
              router.refresh()
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Motivo da Perda</label>
                <textarea
                  required
                  value={motivoPerda}
                  onChange={e => setMotivoPerda(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-red-500 focus:outline-none min-h-[120px]"
                  placeholder="Ex: Preço elevado, comprou noutro stand, desistiu..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-red-600 text-white font-bold py-4 rounded-2xl hover:bg-red-700 uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95">Confirmar Perda</button>
                <button type="button" onClick={() => setModalPerdida(false)} className="px-6 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 uppercase tracking-widest text-xs transition-all">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DndContext>
  )
}
