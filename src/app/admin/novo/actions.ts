'use server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache';
import { getTenant } from '@/utils/tenant';

export type FormState = {
  error?: string;
  success?: boolean;
} | null;

export async function addVehicle(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()

  // 1. Verificar se estamos a EDITAR ou a CRIAR
  const vehicleId = formData.get('id') as string

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Sessão expirada. Faça login novamente." }

  const stand = await getTenant()
  if (!stand) return { error: "Stand não identificado." }


  // Gestão de Imagens
  const retainedImages = formData.getAll('retained_images') as string[]
  const newFiles = formData.getAll('novas_imagens') as File[]
  
  const finalImages = [...retainedImages]

  // Fazer upload de novas imagens
  for (const file of newFiles) {
    if (file.size > 0 && file.name !== 'undefined') {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${stand.id}/${fileName}` // Organizar fotos por stand_id

      const { error: uploadError } = await supabase.storage
        .from('carros_imagens')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError)
        return { error: "Erro ao fazer upload das imagens: " + uploadError.message }
      }

      // Obter URL público
      const { data: publicUrlData } = supabase.storage
        .from('carros_imagens')
        .getPublicUrl(filePath)

      finalImages.push(publicUrlData.publicUrl)
    }
  }

  // Obter carro antigo se for edição para apagar imagens velhas do bucket
  if (vehicleId) {
    const { data: oldCar } = await supabase.from('carros').select('imagens').eq('id', vehicleId).single()
    if (oldCar && oldCar.imagens) {
      const deletedImages = oldCar.imagens.filter((url: string) => !retainedImages.includes(url))
      
      for (const url of deletedImages) {
        // O URL tem o formato completo, precisamos de extrair apenas o caminho relativo (stand_id/filename)
        // Exemplo de URL: https://[project].supabase.co/storage/v1/object/public/carros_imagens/[stand_id]/[filename]
        const urlParts = url.split('/carros_imagens/')
        if (urlParts.length > 1) {
          const pathToDelete = urlParts[1]
          await supabase.storage.from('carros_imagens').remove([pathToDelete])
        }
      }
    }
  }

  // Helper para parsing seguro de números
  const parseNum = (val: any, type: 'int' | 'float' = 'int') => {
    if (!val || val === '') return null
    const n = type === 'int' ? parseInt(val) : parseFloat(val)
    return isNaN(n) ? null : n
  }

  // 2. Extrair dados do formulário
  const rawData = {
    marca: formData.get('marca') as string,
    modelo: formData.get('modelo') as string,
    matricula: formData.get('matricula') as string,
    vin: formData.get('vin') as string,
    ano: parseNum(formData.get('ano')),
    preco: parseNum(formData.get('preco'), 'float'),
    preco_compra: parseNum(formData.get('preco_compra'), 'float'),
    km: parseNum(formData.get('km')),
    combustivel: formData.get('combustivel') as string,
    transmissao: formData.get('transmissao') as string,
    cor: formData.get('cor') as string,
    segmento: formData.get('segmento') as string,
    potencia_cavalos: parseNum(formData.get('potencia_cavalos')),
    potencia_kw: parseNum(formData.get('potencia_kw')),
    cilindrada: parseNum(formData.get('cilindrada')),
    descricao: formData.get('descricao') as string,
    importado: formData.get('importado') === 'on',
    vendido: formData.get('status') === 'vendido', // Mantemos para compatibilidade
    status: formData.get('status') as string || 'disponivel',
    data_aquisicao: (formData.get('status') === 'disponivel' && !dadosIniciais?.data_aquisicao) 
      ? new Date().toISOString() 
      : dadosIniciais?.data_aquisicao,
    oculto: formData.get('oculto') === 'on',
    imagens: finalImages,
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
    console.error('Erro ao salvar carro:', result.error)
    return { error: "Erro ao salvar: " + result.error.message }
  }


  redirect('/admin')
}
