import { createClient } from '@/utils/supabase/server'
import { FormVeiculo } from '../../novo/form-veiculo'
import { notFound } from 'next/navigation'

export default async function EditarVeiculo({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const supabase = await createClient()
  
  // 1. Buscar os dados do carro pelo ID da URL
  const { data: carro, error } = await supabase
    .from('carros')
    .select('*')
    .eq('id', id)
    .single()

  // Se o carro não existir ou houver erro, manda para página 404 oficial
  if (error || !carro) {
    console.error("Erro ao carregar carro:", error)
    notFound()
  }

  // 2. Buscar a cor do stand para manter o branding
  const { data: stand } = await supabase
    .from('stands')
    .select('cor_primaria')
    .eq('id', carro.stand_id)
    .single()

  return (
    <div className="p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900">Editar Viatura</h1>
          <p className="text-slate-500">{carro.marca} {carro.modelo} • {carro.matricula}</p>
        </header>

        {/* Passamos o 'carro' para a prop dadosIniciais que criámos no FormVeiculo */}
        <FormVeiculo 
          cor={stand?.cor_primaria || '#3b82f6'} 
          dadosIniciais={carro} 
        />
      </div>
    </div>
  )
}