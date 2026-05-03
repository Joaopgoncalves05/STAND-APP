import { createClient } from '@/utils/supabase/server'
import { getTenant } from '@/utils/tenant'
import { redirect } from 'next/navigation'
import { NovaLeadClient } from './NovaLeadClient'

export default async function NovaLeadPage() {
  const supabase = await createClient()
  const stand = await getTenant()

  if (!stand) redirect('/login')

  // Fetch vendedores para o dropdown
  const { data: membros } = await supabase
    .from('membros_stand')
    .select('user_id, nome')
    .eq('stand_id', stand.id)

  const { data: { user } } = await supabase.auth.getUser()

  const vendedores = (membros || []).map(m => ({
    user_id: m.user_id,
    nome: m.user_id === user?.id ? `${m.nome} (eu)` : m.nome,
    isCurrentUser: m.user_id === user?.id
  }))

  const { data: carros } = await supabase
    .from('carros')
    .select('id, marca, modelo, ano, preco')
    .eq('stand_id', stand.id)
    .eq('vendido', false)
    .or('oculto.eq.false,oculto.is.null')
    .order('created_at', { ascending: false })

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome, email, telemovel')
    .eq('stand_id', stand.id)
    .order('nome', { ascending: true })

  return (
    <NovaLeadClient 
      vendedores={vendedores} 
      carros={carros || []} 
      clientes={clientes || []}
      currentUserId={user?.id || ''} 
    />
  )
}
