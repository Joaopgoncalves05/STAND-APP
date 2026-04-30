// src/app/admin/novo/page.tsx
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { FormVeiculo } from './form-veiculo'

export default async function NovoVeiculoPage() {
  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost'
  const { data: stand } = await supabase.from('stands').select('cor_primaria').eq('dominio', host).single()

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <FormVeiculo cor={stand?.cor_primaria || '#3b82f6'} />
      </div>
    </div>
  )
}