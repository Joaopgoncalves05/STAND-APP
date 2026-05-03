'use server'

import { createClient } from '@/utils/supabase/server'
import { getTenant } from '@/utils/tenant'

export async function getDashboardStats() {
  const supabase = await createClient()
  const stand = await getTenant()
  if (!stand) return null

  const hoje = new Date()
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString()

  // Buscar vendas do mês
  const { data: vendas } = await supabase
    .from('vendas')
    .select('preco_venda, margem_bruta')
    .eq('stand_id', stand.id)
    .gte('data_venda', inicioMes)

  const numVendasMes = vendas?.length || 0
  const receitaMes = vendas?.reduce((acc, v) => acc + Number(v.preco_venda), 0) || 0
  const margemMes = vendas?.reduce((acc, v) => acc + Number(v.margem_bruta), 0) || 0

  return {
    numVendasMes,
    receitaMes,
    margemMes
  }
}
