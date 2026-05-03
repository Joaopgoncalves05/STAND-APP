import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTenant } from '@/utils/tenant'
import { AdminHeader } from './AdminHeader'
import { ModernFooter } from '@/components/templates/modern/Footer'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Verifica se o utilizador tem sessão iniciada
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Identifica o Stand pelo domínio atual (usando o utilitário)
  const stand = await getTenant()
  
  if (!stand) {
    redirect('/login')
  }

  // 3. VERIFICAÇÃO DE SEGURANÇA: O utilizador pertence a este stand?
  const { data: membro, error } = await supabase
    .from('membros_stand')
    .select('role')
    .eq('user_id', user.id)
    .eq('stand_id', stand.id)
    .maybeSingle()

  // Se não for membro ou houver erro, tchau!
  if (error || !membro) {
    redirect('/login?error=nao-autorizado')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AdminHeader stand={stand} />
      <main className="flex-1">
        {children}
      </main>
      <ModernFooter stand={stand} />
    </div>
  )
}