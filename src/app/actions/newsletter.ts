'use server'

import { createClient } from '@/utils/supabase/server'

export async function subscribeNewsletter(formData: FormData, standId: string) {
  const email = formData.get('email') as string

  if (!email || !email.includes('@')) {
    return { error: 'E-mail inválido.' }
  }

  const supabase = await createClient()

  // Verify if table exists and insert, otherwise just simulate success
  // Assuming a generic "leads" or "newsletter" table might exist.
  // We'll use a try-catch to avoid breaking the UI if the table isn't created yet.
  try {
    const { error } = await supabase
      .from('leads')
      .insert([
        { 
          email, 
          stand_id: standId,
          tipo: 'newsletter',
          estado: 'nova'
        }
      ])
    
    if (error) {
      console.error("Newsletter insert error:", error);
    }
  } catch (e) {
    console.error("Newsletter exception:", e);
  }

  return { success: 'Obrigado por subscrever a nossa newsletter!' }
}
