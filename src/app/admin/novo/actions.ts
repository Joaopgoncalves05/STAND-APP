'use server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache';

// Definimos o tipo do estado para o TypeScript não reclamar
export type FormState = {
  error?: string;
  success?: boolean;
} | null;

export async function addVehicle(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()

  // 1. Verificar se estamos a EDITAR ou a CRIAR
  const vehicleId = formData.get('id') as string // Campo hidden que adicionaste

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Sessão expirada. Faça login novamente." }

  const headersList = await headers()
  const host = headersList.get('host') || 'localhost'
  const { data: stand } = await supabase.from('stands').select('id').eq('dominio', host).single()

  if (!stand) return { error: "Stand não identificado." }

// 2. Extrair dados do formulário
  const rawData = {
    marca: formData.get('marca') as string,
    modelo: formData.get('modelo') as string,
    matricula: formData.get('matricula') as string,
    vin: formData.get('vin') as string,
    ano: parseInt(formData.get('ano') as string),
    preco: parseFloat(formData.get('preco') as string),
    km: parseInt(formData.get('km') as string),
    combustivel: formData.get('combustivel') as string,
    transmissao: formData.get('transmissao') as string,
    cor: formData.get('cor') as string,
    segmento: formData.get('segmento') as string,
    potencia_cavalos: parseInt(formData.get('potencia_cavalos') as string),
    potencia_kw: parseInt(formData.get('potencia_kw') as string),
    cilindrada: parseInt(formData.get('cilindrada') as string),
    descricao: formData.get('descricao') as string,
    importado: formData.get('importado') === 'on',
    vendido: false,
    stand_id: stand.id,
    created_by: user.id,
  }

  let result;

  if (vehicleId) {
    // É uma EDIÇÃO
    result = await supabase
      .from('carros')
      .update(rawData)
      .eq('id', vehicleId)
  } else {
    // É um NOVO VEÍCULO
    result = await supabase
      .from('carros')
      .insert([{ ...rawData, created_by: user.id }])
  }

  if (result.error) {
    return { error: "Erro ao salvar: " + result.error.message }
  }

  redirect('/admin')
}

