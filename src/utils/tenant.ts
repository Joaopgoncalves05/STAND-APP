import { headers } from 'next/headers'
import { createClient } from './supabase/server'

export interface Stand {
  id: string
  dominio: string
  nome: string
  cor_primaria: string
  template_name?: string
  font_family?: string
  logo_url?: string
}

export async function getTenant(): Promise<Stand | null> {
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  
  // Extract domain without port for local testing, or keep full if needed
  // For local testing: 'localhost:3000' or 'stand1.localhost:3000'
  // In production, host would be the actual domain like 'meustand.com'
  
  const supabase = await createClient()

  const { data: stand } = await supabase
    .from('stands')
    .select('*')
    .eq('dominio', host)
    .single()

  if (stand) {
    return stand as Stand
  }

  // Fallback for local dev if host includes localhost but maybe without port
  if (host.includes('localhost')) {
    const { data: localStand } = await supabase
      .from('stands')
      .select('*')
      .ilike('dominio', '%localhost%')
      .limit(1)
      .single()
      
    if (localStand) return localStand as Stand
  }

  return null
}
