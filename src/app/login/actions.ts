'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// O segredo está nesta palavra: "export"
export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    // Se houver erro, volta para o login com uma mensagem
    redirect('/login?error=auth-failed')
  }

  // Se der certo, vai para o admin
  redirect('/admin')
}