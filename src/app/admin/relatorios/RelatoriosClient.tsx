'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

import type { RelatorioData, VendaRow } from './actions'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const STATUS_LABELS: Record<string, string> = {
  disponivel: 'Em Stock',
  vendido: 'Vendido',
  reservado: 'Reservado',
  negociacao: 'Em Negociação'
}

const fmt = (val: number | null) =>
  val !== null
    ? new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(val)
    : '—'

function KpiCard({
  label,
  value,
  sub,
  trend,
  color = 'text-slate-900',
}: {
  label: string
  value: string
  sub?: string
  trend?: number | null
  color?: string
}) {
  const isPos = trend && trend > 0
  const isNeg = trend && trend < 0

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="relative z-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{label}</p>
        <p className={`text-3xl font-black tracking-tight ${color}`}>{value}</p>
        <div className="flex items-center gap-2 mt-1">
          {sub && <p className="text-xs text-slate-400">{sub}</p>}
          {trend !== undefined && trend !== null && (
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
              isPos ? 'bg-green-100 text-green-700' : isNeg ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {isPos ? '↑' : isNeg ? '↓' : ''} {Math.abs(trend).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      {/* Subtle background decoration */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
           <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        </svg>
      </div>
    </div>
  )
}

function exportCSV(vendas: VendaRow[], ano: number, mes: number) {
  const headers = ['Data', 'Cliente', 'Viatura', 'Vendedor', 'Preço Venda', 'Preço Compra', 'Margem', 'Comissão']
  const rows = vendas.map(v => [
    new Date(v.data_venda).toLocaleDateString('pt-PT'),
    v.cliente?.nome ?? v.lead?.nome ?? '—',
    v.carro ? `${v.carro.marca} ${v.carro.modelo} (${v.carro.ano})` : '—',
    v.vendedor?.email ?? '—',
    v.preco_venda.toFixed(2),
    v.preco_compra?.toFixed(2) ?? '—',
    v.margem_bruta.toFixed(2),
    v.comissao_valor?.toFixed(2) ?? '—',
  ])

  const csvContent = [headers, ...rows].map(r => r.join(';')).join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `relatorio_vendas_${MESES[mes - 1].toLowerCase()}_${ano}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function RelatoriosClient({
  relatorio,
  ano,
  mes,
}: {
  relatorio: RelatorioData
  ano: number
  mes: number
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'vendas' | 'compras'>('vendas')
  
  const { 
    vendas, totalReceita, totalMargem, totalComissoes, numVendas, 
    numAngariacoes, taxaConversao, topVendedor, porFonte, tendencia, compras
  } = relatorio



  function navTo(newMes: number, newAno: number) {
    router.push(`/admin/relatorios?mes=${newMes}&ano=${newAno}`)
  }


  function prevMonth() {
    if (mes === 1) navTo(12, ano - 1)
    else navTo(mes - 1, ano)
  }

  function nextMonth() {
    const hoje = new Date()
    if (ano === hoje.getFullYear() && mes === hoje.getMonth() + 1) return
    if (mes === 12) navTo(1, ano + 1)
    else navTo(mes + 1, ano)
  }

  const isCurrentMonth = (() => {
    const hoje = new Date()
    return ano === hoje.getFullYear() && mes === hoje.getMonth() + 1
  })()

  const margemPercent = totalReceita > 0 ? ((totalMargem / totalReceita) * 100).toFixed(1) : null

  return (
    <div className="min-h-screen bg-[#f9f9f9] font-['Manrope'] text-[#1b1b1b]">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-100 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <nav className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <Link href="/admin" className="hover:text-black transition-colors">Admin</Link>
            <span>/</span>
            <span className="text-black">Relatórios</span>
          </nav>

          <button
            onClick={() => exportCSV(vendas, ano, mes)}
            disabled={vendas.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#e35a39] disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* Month Navigator */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-black">Relatório Financeiro</h1>
            <p className="text-slate-400 text-sm mt-1">Desempenho comercial por período</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-center min-w-[160px]">
              <p className="text-lg font-black tracking-tight">{MESES[mes - 1]} {ano}</p>
              {isCurrentMonth && (
                <span className="text-[10px] font-black text-[#e35a39] uppercase tracking-widest">Mês Actual</span>
              )}
            </div>

            <button
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* TAB SELECTOR */}
        <div className="flex gap-1 bg-slate-200/50 p-1 rounded-2xl w-fit mb-8">
          <button 
            onClick={() => setActiveTab('vendas')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'vendas' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Análise de Vendas
          </button>
          <button 
            onClick={() => setActiveTab('compras')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'compras' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Análise de Compras
          </button>
        </div>

        {activeTab === 'vendas' ? (
          <>
            {/* KPI Cards Vendas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <KpiCard
                label="Receita Total"
                value={fmt(totalReceita)}
                sub={`${numVendas} venda${numVendas !== 1 ? 's' : ''}`}
                trend={tendencia.receita}
                color="text-slate-900"
              />
              <KpiCard
                label="Margem Bruta"
                value={fmt(totalMargem)}
                sub={margemPercent ? `${margemPercent}% da receita` : undefined}
                trend={tendencia.margem}
                color={totalMargem >= 0 ? 'text-green-600' : 'text-red-600'}
              />
              <KpiCard
                label="Unidades Vendidas"
                value={numVendas.toString()}
                sub="Volume mensal"
                trend={tendencia.vendas}
                color="text-[#e35a39]"
              />
              <KpiCard
                label="Novas Angariações"
                value={numAngariacoes.toString()}
                sub="Stock adquirido"
                trend={tendencia.compras}
                color="text-blue-600"
              />
            </div>

            {/* Efficiency Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Taxa de Conversão (Vendas)</p>
                  <p className="text-3xl font-black text-slate-900">{relatorio.leads.conversaoVenda.toFixed(1)}%</p>
                  <p className="text-xs text-slate-400 mt-1">{relatorio.leads.venda} leads de venda em pipeline</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Encargos Comissões</p>
                  <p className="text-3xl font-black text-[#e35a39]">{fmt(totalComissoes)}</p>
                  <p className="text-xs text-slate-400 mt-1">Total a pagar à equipa comercial</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
              </div>
            </div>

            {/* Vendas por Fonte */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
                  Origem das Vendas
                </h3>
                <div className="space-y-4">
                  {Object.entries(porFonte).length > 0 ? (
                    Object.entries(porFonte).sort((a,b) => b[1] - a[1]).map(([fonte, count]) => (
                      <div key={fonte}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-slate-600 capitalize">{fonte}</span>
                          <span className="text-xs font-black text-slate-900">{count} {count === 1 ? 'venda' : 'vendas'}</span>
                        </div>
                        <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(count / numVendas) * 100}%` }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-300 text-xs font-bold uppercase tracking-widest">Sem dados</div>
                  )}
                </div>
              </div>
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col justify-center">
                <div className="text-center py-12 text-slate-300 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-slate-50 rounded-2xl">
                   Gráfico de Crescimento Temporal
                </div>
              </div>
            </div>

            {/* Tabela de Vendas */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Listagem de Vendas</h2>
                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{numVendas} unid.</span>
              </div>
              {vendas.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-sm font-bold">Sem vendas neste período.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <th className="text-left px-6 py-3">Data</th>
                        <th className="text-left px-4 py-3">Cliente</th>
                        <th className="text-left px-4 py-3">Viatura</th>
                        <th className="text-right px-4 py-3">Venda</th>
                        <th className="text-right px-4 py-3">Margem</th>
                        <th className="text-right px-6 py-3">Comissão</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {vendas.map(v => (
                        <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4 text-xs text-slate-500">{new Date(v.data_venda).toLocaleDateString('pt-PT')}</td>
                          <td className="px-4 py-4 font-bold">{v.cliente?.nome ?? v.lead?.nome ?? '—'}</td>
                          <td className="px-4 py-4 text-slate-600">{v.carro?.marca} {v.carro?.modelo}</td>
                          <td className="px-4 py-4 text-right font-black">{fmt(v.preco_venda)}</td>
                          <td className={`px-4 py-4 text-right font-black ${v.margem_bruta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {v.margem_bruta >= 0 ? '+' : ''}{fmt(v.margem_bruta)}
                          </td>
                          <td className="px-6 py-4 text-right text-[#e35a39] font-bold">{fmt(v.comissao_valor ?? 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-black">
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-xs uppercase tracking-widest text-slate-500">Total</td>
                        <td className="px-4 py-4 text-right">{fmt(totalReceita)}</td>
                        <td className={`px-4 py-4 text-right ${totalMargem >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(totalMargem)}</td>
                        <td className="px-6 py-4 text-right text-[#e35a39]">{fmt(totalComissoes)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* KPI Cards Compras */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <KpiCard
                label="Investimento Total"
                value={fmt(compras.totalInvestido)}
                sub={`${compras.numCompras} viaturas adquiridas`}
                trend={tendencia.investimento}
                color="text-slate-900"
              />
              <KpiCard
                label="Custo Médio / Unid."
                value={fmt(compras.custoMedio)}
                sub="Média por viatura"
                color="text-blue-600"
              />
              <KpiCard
                label="Angariações"
                value={numAngariacoes.toString()}
                sub="Volume mensal"
                trend={tendencia.compras}
                color="text-slate-900"
              />
              <KpiCard
                label="Taxa Conversão (Compra)"
                value={`${relatorio.leads.conversaoCompra.toFixed(1)}%`}
                sub={`${relatorio.leads.compra} leads de compra`}
                color="text-green-600"
              />
            </div>

            {/* Purchases Content */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Listagem de Aquisições</h2>
                <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{compras.numCompras} unid.</span>
              </div>
              {compras.lista.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-sm font-bold">Sem aquisições registadas neste período.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <th className="text-left px-6 py-3">Data</th>
                        <th className="text-left px-4 py-3">Viatura</th>
                        <th className="text-left px-4 py-3">Matrícula</th>
                        <th className="text-left px-4 py-3">Estado Atual</th>
                        <th className="text-right px-6 py-3">Custo de Compra</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {compras.lista.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4 text-xs text-slate-500">{new Date(c.data_aquisicao).toLocaleDateString('pt-PT')}</td>
                          <td className="px-4 py-4 font-bold">{c.marca} {c.modelo}</td>
                          <td className="px-4 py-4 font-mono text-xs">{c.matricula}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                              c.status === 'vendido' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                            }`}>
                              {STATUS_LABELS[c.status] || c.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-black">{fmt(c.preco_compra)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-black">
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-xs uppercase tracking-widest text-slate-500">Total Investimento</td>
                        <td className="px-6 py-4 text-right">{fmt(compras.totalInvestido)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

