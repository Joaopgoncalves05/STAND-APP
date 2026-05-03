import { getTenant } from '@/utils/tenant'
import { createClient } from '@/utils/supabase/server'
import { ModernHome } from '@/components/templates/modern/Home'
import { NotFoundStand } from '@/components/ui/NotFoundStand'

export default async function Page() {
  const stand = await getTenant()

  if (!stand) {
    return <NotFoundStand />
  }

  const supabase = await createClient()

  // Buscar carros recentes para a homepage
  const { data: cars } = await supabase
    .from('carros')
    .select('*')
    .eq('stand_id', stand.id)
    .or('oculto.eq.false,oculto.is.null')
    .neq('status', 'negociacao')
    .order('created_at', { ascending: false })
    .limit(8)

  // Aqui no futuro poderíamos ter um switch baseando-se no stand.template_name
  // if (stand.template_name === 'classico') return <ClassicHome ... />
  // Por agora usamos o template moderno como base
  
  return <ModernHome stand={stand} recentCars={cars || []} />
}