import { getTenant } from '@/utils/tenant'
import { createClient } from '@/utils/supabase/server'
import { NotFoundStand } from '@/components/ui/NotFoundStand'
import { ModernCarDetails } from '@/components/templates/modern/CarDetails'
import { notFound } from 'next/navigation'

export default async function CarroPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const stand = await getTenant()

  if (!stand) {
    return <NotFoundStand />
  }

  const resolvedParams = await params;
  const supabase = await createClient()

  const { data: car } = await supabase
    .from('carros')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('stand_id', stand.id) // Segurança: garantir que o carro pertence ao stand
    .neq('status', 'negociacao')
    .single()

  if (!car) {
    notFound() // Renderiza a página 404 do Next.js
  }

  return <ModernCarDetails stand={stand} car={car} />
}
