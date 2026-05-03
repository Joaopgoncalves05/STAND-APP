import { getTenant } from '@/utils/tenant'
import { createClient } from '@/utils/supabase/server'
import { NotFoundStand } from '@/components/ui/NotFoundStand'
import { ModernCatalog } from '@/components/templates/modern/Catalog'

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const stand = await getTenant()

  if (!stand) {
    return <NotFoundStand />
  }

  const resolvedSearchParams = await searchParams;
  const supabase = await createClient()

  let query = supabase
    .from('carros')
    .select('*')
    .eq('stand_id', stand.id)
    .or('oculto.eq.false,oculto.is.null')
    .neq('status', 'negociacao')

  // Aplicar Filtros
  if (resolvedSearchParams.q) {
    // Busca por marca ou modelo
    query = query.or(`marca.ilike.%${resolvedSearchParams.q}%,modelo.ilike.%${resolvedSearchParams.q}%`)
  }

  if (resolvedSearchParams.transmissao) {
    query = query.eq('transmissao', resolvedSearchParams.transmissao)
  }

  if (resolvedSearchParams.segmento) {
    query = query.eq('segmento', resolvedSearchParams.segmento)
  }

  if (resolvedSearchParams.combustivel) {
    query = query.eq('combustivel', resolvedSearchParams.combustivel)
  }

  if (resolvedSearchParams.precoMin) {
    query = query.gte('preco', Number(resolvedSearchParams.precoMin))
  }

  if (resolvedSearchParams.precoMax) {
    query = query.lte('preco', Number(resolvedSearchParams.precoMax))
  }

  if (resolvedSearchParams.anoMin) {
    query = query.gte('ano', Number(resolvedSearchParams.anoMin))
  }

  if (resolvedSearchParams.anoMax) {
    query = query.lte('ano', Number(resolvedSearchParams.anoMax))
  }

  if (resolvedSearchParams.kmMin) {
    query = query.gte('km', Number(resolvedSearchParams.kmMin))
  }

  if (resolvedSearchParams.kmMax) {
    query = query.lte('km', Number(resolvedSearchParams.kmMax))
  }

  let orderColumn = 'created_at'
  let orderAscending = false

  if (resolvedSearchParams.ordem) {
    switch (resolvedSearchParams.ordem) {
      case 'preco_asc':
        orderColumn = 'preco'
        orderAscending = true
        break
      case 'preco_desc':
        orderColumn = 'preco'
        orderAscending = false
        break
      case 'km_asc':
        orderColumn = 'km'
        orderAscending = true
        break
      case 'ano_desc':
        orderColumn = 'ano'
        orderAscending = false
        break
      default:
        orderColumn = 'created_at'
        orderAscending = false
    }
  }

  const { data: cars } = await query.order(orderColumn, { ascending: orderAscending })

  return <ModernCatalog stand={stand} cars={cars || []} searchParams={resolvedSearchParams} />
}
