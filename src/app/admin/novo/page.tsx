// src/app/admin/novo/page.tsx
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { FormVeiculo } from './form-veiculo'

export default async function NovoVeiculoPage() {
  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost'
  const { data: stand } = await supabase.from('stands').select('cor_primaria, nome').eq('dominio', host).single()

  return (
    <div className="p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900">Novo Veículo</h1>
          <p className="text-slate-500">Adicione uma nova viatura ao inventário do {stand?.nome || 'stand'}</p>
        </header>
        <FormVeiculo cor={stand?.cor_primaria || '#3b82f6'} />
      </div>
    </div>
  )
}