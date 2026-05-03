import { createClient } from '@/utils/supabase/server'
import { getTenant } from '@/utils/tenant'
import { redirect, notFound } from 'next/navigation'
import { LeadDetailClient } from "./LeadDetailClient"

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const stand = await getTenant()
  if (!stand) redirect('/login')

  const { id } = await params

  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .eq('stand_id', stand.id)
    .single()

  if (!lead) notFound()

  // Cliente separado
  let cliente = null
  if (lead.cliente_id) {
    const { data } = await supabase.from('clientes')
      .select('id, nome, email, telemovel, nif, data_nascimento, morada, cod_postal, localidade, tipo_cliente, canal_origem, orcamento_min, orcamento_max, preferencias, tags, consentimento_marketing, veiculo_atual, notas_internas, updated_at')
      .eq('id', lead.cliente_id).single()
    cliente = data
  }

  // Carro original (carro_id)
  let carroOriginal = null
  if (lead.carro_id) {
    const { data } = await supabase.from('carros')
      .select('id, marca, modelo, ano, preco, imagens').eq('id', lead.carro_id).single()
    carroOriginal = data
  }

  // Carros de interesse (array)
  let carrosInteresse: any[] = []
  const interesseIds: string[] = lead.carros_interesse || []
  if (interesseIds.length > 0) {
    const { data } = await supabase.from('carros')
      .select('id, marca, modelo, ano, preco, imagens')
      .in('id', interesseIds)
    carrosInteresse = data || []
  }

  // Todos os carros disponíveis para adicionar (simplificado)
  const { data: todosCarros } = await supabase.from('carros')
    .select('id, marca, modelo, ano, preco')
    .eq('stand_id', stand.id)
    .or('oculto.eq.false,oculto.is.null')
    .order('created_at', { ascending: false })
    .limit(100)

  // Membros do stand
  const { data: membros } = await supabase.from('membros_stand')
    .select('id, user_id, role').eq('stand_id', stand.id)

  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const vendedores = (membros || []).map(m => ({
    id: m.id,
    user_id: m.user_id,
    role: m.role,
    nome: m.user_id === currentUser?.id ? (currentUser?.email || m.user_id) : m.user_id,
    isCurrentUser: m.user_id === currentUser?.id,
  }))

  // Actividade
  const { data: atividade } = await supabase.from('lead_atividade')
    .select('*').eq('lead_id', id)
    .order('created_at', { ascending: false }).limit(30)

  return (
    <LeadDetailClient
      lead={{ ...lead, clientes: cliente }}
      carroOriginal={carroOriginal}
      carrosInteresse={carrosInteresse}
      interesseIds={interesseIds}
      todosCarros={todosCarros || []}
      vendedores={vendedores}
      atividade={atividade || []}
      currentUserId={currentUser?.id || ''}
    />
  )
}
