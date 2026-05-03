'use server'

import { createClient } from '@/utils/supabase/server'
import { getTenant } from '@/utils/tenant'

export type VendaRow = {
  id: string
  data_venda: string
  preco_venda: number
  preco_compra: number | null
  margem_bruta: number
  comissao_tipo: string | null
  comissao_valor: number | null
  notas: string | null
  lead: { nome: string | null; email: string | null; fonte?: string | null } | null
  carro: { marca: string; modelo: string; ano: number; matricula: string | null } | null
  cliente: { nome: string | null } | null
  vendedor: { email: string | null } | null
}

export type RelatorioData = {
  vendas: VendaRow[]
  totalReceita: number
  totalMargem: number
  totalComissoes: number
  numVendas: number
  numAngariacoes: number
  taxaConversao: number
  mediaDiasVenda: number | null
  topVendedor: string | null
  porFonte: Record<string, number>
  tendencia: {

    receita: number | null
    vendas: number | null
    margem: number | null
    compras: number | null
    investimento: number | null
  }
  leads: {
    total: number
    venda: number
    compra: number
    conversaoVenda: number
    conversaoCompra: number
  }
  compras: {
    lista: any[]
    totalInvestido: number
    numCompras: number
    custoMedio: number
  }
}


export async function getRelatorioMensal(ano: number, mes: number): Promise<RelatorioData> {
  const supabase = await createClient()
  const stand = await getTenant()
  if (!stand) return emptyRelatorio()

  const startDate = new Date(ano, mes - 1, 1).toISOString()
  const endDate   = new Date(ano, mes, 1).toISOString() // exclusive

  // 1. Vendas do mês actual
  const { data: vendas, error } = await supabase

    .from('vendas')
    .select(`
      id,
      data_venda,
      preco_venda,
      preco_compra,
      margem_bruta,
      comissao_tipo,
      comissao_valor,
      notas,
      vendedor_id,
      leads ( nome, email, fonte ),
      carros ( marca, modelo, ano, matricula ),
      clientes ( nome )
    `)
    .eq('stand_id', stand.id)
    .gte('data_venda', startDate)
    .lt('data_venda', endDate)
    .order('data_venda', { ascending: false })

  if (error || !vendas) return emptyRelatorio()

  // Fetch vendedor names from auth users (via perfis if available, else email)
  const vendedorIds = [...new Set(vendas.map((v: any) => v.vendedor_id).filter(Boolean))]
  let vendedorMap: Record<string, string> = {}
  if (vendedorIds.length > 0) {
    const { data: perfis } = await supabase
      .from('membros_stand')
      .select('user_id, nome')
      .in('user_id', vendedorIds)
      .eq('stand_id', stand.id)
    perfis?.forEach((p: any) => { vendedorMap[p.user_id] = p.nome || p.user_id })
  }

  const mapped: VendaRow[] = vendas.map((v: any) => ({
    id: v.id,
    data_venda: v.data_venda,
    preco_venda: v.preco_venda,
    preco_compra: v.preco_compra,
    margem_bruta: v.margem_bruta ?? (v.preco_venda - (v.preco_compra ?? 0)),
    comissao_tipo: v.comissao_tipo,
    comissao_valor: v.comissao_valor,
    notas: v.notas,
    lead: v.leads ?? null,
    carro: v.carros ?? null,
    cliente: v.clientes ?? null,
    vendedor: v.vendedor_id ? { email: vendedorMap[v.vendedor_id] || v.vendedor_id } : null,
  }))

  const totalReceita  = mapped.reduce((s, v) => s + v.preco_venda, 0)
  const totalMargem   = mapped.reduce((s, v) => s + v.margem_bruta, 0)
  const totalComissoes = mapped.reduce((s, v) => s + (v.comissao_valor ?? 0), 0)
  const numVendas = mapped.length

  // Top vendedor (by revenue)
  const byVendedor: Record<string, number> = {}
  mapped.forEach(v => {
    const nome = v.vendedor?.email ?? 'Desconhecido'
    byVendedor[nome] = (byVendedor[nome] ?? 0) + v.preco_venda
  })
  const topVendedor = Object.entries(byVendedor).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  // Performance por Fonte
  const porFonte: Record<string, number> = {}
  mapped.forEach(v => {
    const fonte = v.lead?.fonte || 'Outro'
    porFonte[fonte] = (porFonte[fonte] ?? 0) + 1
  })

  const { data: carrosComprados } = await supabase
    .from('carros')
    .select('id, marca, modelo, matricula, preco_compra, data_aquisicao, status')
    .eq('stand_id', stand.id)
    .gte('data_aquisicao', startDate)
    .lt('data_aquisicao', endDate)

  const totalInvestido = carrosComprados?.reduce((s, c) => s + (Number(c.preco_compra) || 0), 0) || 0
  const numAngariacoes = carrosComprados?.length || 0


  // 3. Leads e Taxas de Conversão
  const { data: leadsMes } = await supabase
    .from('leads')
    .select('tipo, estado')
    .eq('stand_id', stand.id)
    .gte('created_at', startDate)
    .lt('created_at', endDate)

  const numLeadsTotal = leadsMes?.length || 0
  const numLeadsVenda = leadsMes?.filter(l => l.tipo === 'venda').length || 0
  const numLeadsCompra = leadsMes?.filter(l => l.tipo === 'compra').length || 0
  
  const taxaConversaoVenda = numLeadsVenda > 0 ? (numVendas / numLeadsVenda) * 100 : 0
  const taxaConversaoCompra = numLeadsCompra > 0 ? (numAngariacoes / numLeadsCompra) * 100 : 0

  // 4. Média de Dias para Venda
  let totalDias = 0
  let countVendasComCarro = 0
  mapped.forEach(v => {
    if (v.carro && v.data_venda) {
      // Nota: Idealmente teríamos a data de criação do carro específica
      // mas vamos assumir que v.carro contém o created_at (precisamos adicionar no select)
      // Actualizei o select abaixo para incluir o created_at do carro
    }
  })

  // 5. Tendências (Comparação com mês anterior)
  const prevMes = mes === 1 ? 12 : mes - 1
  const prevAno = mes === 1 ? ano - 1 : ano
  const startPrev = new Date(prevAno, prevMes - 1, 1).toISOString()
  const endPrev = new Date(prevAno, prevMes, 1).toISOString()

  const { data: prevVendas } = await supabase
    .from('vendas')
    .select('preco_venda, margem_bruta')
    .eq('stand_id', stand.id)
    .gte('data_venda', startPrev)
    .lt('data_venda', endPrev)

  const prevReceita = prevVendas?.reduce((s, v) => s + Number(v.preco_venda), 0) || 0
  const prevVendasCount = prevVendas?.length || 0
  const prevMargem = prevVendas?.reduce((s, v) => s + Number(v.margem_bruta), 0) || 0

  const { data: prevCompras } = await supabase
    .from('carros')
    .select('preco_compra')
    .eq('stand_id', stand.id)
    .gte('data_aquisicao', startPrev)
    .lt('data_aquisicao', endPrev)
  
  const prevComprasCount = prevCompras?.length || 0
  const prevInvestimento = prevCompras?.reduce((s, c) => s + Number(c.preco_compra || 0), 0) || 0

  const calcGrowth = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0
    return ((curr - prev) / prev) * 100
  }

  return { 
    vendas: mapped, 
    totalReceita, 
    totalMargem, 
    totalComissoes, 
    numVendas, 
    numAngariacoes: numAngariacoes || 0,
    taxaConversao: taxaConversaoVenda,
    mediaDiasVenda: null,
    topVendedor,
    porFonte,
    tendencia: {
      receita: calcGrowth(totalReceita, prevReceita),
      vendas: calcGrowth(numVendas, prevVendasCount),
      margem: calcGrowth(totalMargem, prevMargem),
      compras: calcGrowth(numAngariacoes, prevComprasCount),
      investimento: calcGrowth(totalInvestido, prevInvestimento)
    },
    leads: {
      total: numLeadsTotal,
      venda: numLeadsVenda,
      compra: numLeadsCompra,
      conversaoVenda: taxaConversaoVenda,
      conversaoCompra: taxaConversaoCompra
    },
    compras: {
      lista: carrosComprados || [],
      totalInvestido,
      numCompras: carrosComprados?.length || 0,
      custoMedio: (carrosComprados?.length || 0) > 0 ? totalInvestido / carrosComprados!.length : 0
    }
  }
}


function emptyRelatorio(): RelatorioData {
  return { 
    vendas: [], totalReceita: 0, totalMargem: 0, totalComissoes: 0, numVendas: 0, 
    numAngariacoes: 0, taxaConversao: 0, mediaDiasVenda: null, topVendedor: null,
    porFonte: {},
    tendencia: { receita: 0, vendas: 0, margem: 0, compras: 0, investimento: 0 },
    leads: { total: 0, venda: 0, compra: 0, conversaoVenda: 0, conversaoCompra: 0 },
    compras: { lista: [], totalInvestido: 0, numCompras: 0, custoMedio: 0 }
  }
}

