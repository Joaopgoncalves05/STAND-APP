import { createClient } from '@/utils/supabase/server'
import { getTenant } from '@/utils/tenant'
import { redirect, notFound } from 'next/navigation'
import { ClienteDetailClient } from './ClienteDetailClient'

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const stand = await getTenant()

  if (!stand) redirect('/login')

  const { id } = await params

  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .eq('stand_id', stand.id)
    .single()

  if (!cliente) notFound()

  const { data: leads } = await supabase
    .from('leads')
    .select('id, tipo, estado, mensagem, created_at, valor_estimado, dados_viatura, carro_id, prioridade, fonte')
    .eq('cliente_id', id)
    .eq('stand_id', stand.id)
    .order('created_at', { ascending: false })

  return <ClienteDetailClient cliente={cliente} leads={leads || []} />
}
