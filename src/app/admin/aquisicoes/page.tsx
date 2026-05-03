import { createClient } from '@/utils/supabase/server'
import { getTenant } from '@/utils/tenant'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BotaoConfirmarCompra } from './btn-confirmar'

const ESTADO_L: Record<string, string> = {
  nova: 'Nova', em_contacto: 'Em Contacto', test_drive: 'Test Drive',
  proposta: 'Proposta', ganha: 'Ganha', perdida: 'Perdida',
}

export default async function AquisicoesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const stand = await getTenant()
  const corPrimaria = stand?.cor_primaria || '#3b82f6'

  // Buscar viaturas em negociação com info da lead
  // Primeiro tentamos com o join standard
  let { data: negociacoes, error } = await supabase
    .from('carros')
    .select('*, leads!lead_id(id, nome, email, estado)')
    .eq('stand_id', stand?.id)
    .eq('status', 'negociacao')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar negociações (com join):', error)
    // Fallback: tentar sem o join para ver se os carros aparecem
    const { data: rawCars, error: rawError } = await supabase
      .from('carros')
      .select('*')
      .eq('stand_id', stand?.id)
      .eq('status', 'negociacao')
      .order('created_at', { ascending: false })
    
    if (!rawError) {
      negociacoes = rawCars
    }
  }

  return (
    <div className="p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900">Aquisições & Pipeline</h1>
          <p className="text-slate-500">Viaturas em fase de avaliação, retoma ou negociação de compra.</p>
        </header>

        {/* INFO CARD */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-blue-900 font-bold">Gerir Pipeline de Compra</p>
              <p className="text-blue-700 text-sm">Estas viaturas não aparecem no site público até serem confirmadas.</p>
            </div>
          </div>
          <Link 
            href="/admin/novo"
            className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-sm border border-blue-200 hover:bg-blue-100 transition-all"
          >
            Registar Nova Negociação
          </Link>
        </div>

        {/* LISTA DE NEGOCIAÇÕES */}
        <div className="grid grid-cols-1 gap-6">
          {negociacoes?.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sem negociações ativas</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">As viaturas que estás a avaliar ou comprar aparecerão aqui.</p>
            </div>
          ) : (
            negociacoes?.map((carro) => (
              <div key={carro.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row items-center gap-6 group hover:shadow-xl hover:border-blue-200 transition-all">
                {/* Foto Miniatura */}
                <div className="w-32 h-32 md:w-40 md:h-24 bg-slate-100 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                  {carro.imagens && carro.imagens.length > 0 ? (
                    <img src={carro.imagens[0]} alt={carro.modelo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                </div>

                {/* Detalhes Principais */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded">EM NEGOCIAÇÃO</span>
                    <span className="text-slate-400 text-xs">• Criado em {new Date(carro.created_at).toLocaleDateString('pt-PT')}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{carro.marca} {carro.modelo}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                      {carro.matricula}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {carro.preco_compra ? `${new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(carro.preco_compra)} (Custo)` : 'Custo não definido'}
                    </span>
                  </div>
                  
                  {carro.leads && (
                    <div className="flex items-center gap-3 mt-3">
                      <Link 
                        href={`/admin/leads/${carro.leads.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Lead: {carro.leads.nome || carro.leads.email || 'Ver Detalhes'}
                      </Link>
                      {carro.leads.estado && (
                        <span className="px-2 py-0.5 bg-slate-800 text-white text-[9px] font-bold uppercase tracking-widest rounded-full">
                          Estado Lead: {ESTADO_L[carro.leads.estado] || carro.leads.estado}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-3">
                  <Link 
                    href={`/admin/editar/${carro.id}`}
                    className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    Ver Detalhes / Editar
                  </Link>
                  <BotaoConfirmarCompra id={carro.id} cor={corPrimaria} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
