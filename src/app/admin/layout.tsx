import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Verifica se o utilizador tem sessão iniciada
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Identifica o Stand pelo domínio atual
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost'
  
  const { data: stand } = await supabase
    .from('stands')
    .select('id')
    .eq('dominio', host)
    .single()

  if (!stand) redirect('/login')

  // 3. VERIFICAÇÃO DE SEGURANÇA: O utilizador pertence a este stand?
  const { data: membro } = await supabase
    .from('membros_stand')
    .select('role')
    .eq('user_id', user.id)
    .eq('stand_id', stand.id)
    .single()

  // Se não for membro, tchau!
  if (!membro) {
    redirect('/login?error=nao-autorizado')
  }

  return <>{children}</>
}