'use server'

import { createClient } from '@/utils/supabase/server'
import { getTenant } from '@/utils/tenant'
import { revalidatePath } from 'next/cache'

export async function submitLead(formData: FormData) {
  const supabase = await createClient()
  const stand = await getTenant()

  if (!stand) {
    return { error: 'Stand não encontrado' }
  }

  let tipo = formData.get('tipo') as string
  // No wizard publico, 'venda' (do cliente) = 'compra' (do stand)
  if (tipo === 'venda') tipo = 'compra'

  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const telemovel = formData.get('telemovel') as string
  const mensagem = formData.get('mensagem') as string
  const preferencia_contacto = formData.get('preferencia_contacto') as string
  const carro_id = formData.get('carro_id') as string
  const fonte = (formData.get('fonte') as string) || 'website'

  // Para o wizard de venda – upload de fotos
  const fotos = formData.getAll('fotos') as File[]
  const uploadedFotos: string[] = []

  if (fotos.length > 0) {
    for (const foto of fotos) {
      if (foto.size === 0) continue

      const fileExt = foto.name.split('.').pop()
      const fileName = `${stand.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage
        .from('carros_imagens')
        .upload(fileName, foto)

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('carros_imagens')
          .getPublicUrl(fileName)
        uploadedFotos.push(publicUrl)
      } else {
        console.error('Erro ao fazer upload da foto:', uploadError)
      }
    }
  }

  const dados_viatura = tipo === 'compra' ? {
    marca: formData.get('marca'),
    modelo: formData.get('modelo'),
    ano: formData.get('ano'),
    matricula: formData.get('matricula'),
    estado: formData.get('estado'),
    informacoes_adicionais: formData.get('informacoes_adicionais'),
    fotos: uploadedFotos,
  } : null

  const { data: insertedLead, error } = await supabase
    .from('leads')
    .insert({
      stand_id: stand.id,
      tipo,
      nome,
      email,
      telemovel,
      mensagem,
      preferencia_contacto,
      fonte,
      dados_viatura,
      carro_id: carro_id || null,
      estado: 'nova',
      prioridade: 'media',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Erro ao submeter lead:', error)
    return { error: 'Ocorreu um erro ao enviar o seu pedido. Por favor tente mais tarde.' }
  }

  // Auto-link lead to cliente e criar viatura se for compra
  if (insertedLead?.id) {
    await supabase.rpc('upsert_cliente_from_lead', {
      p_lead_id: insertedLead.id
    })

    if (tipo === 'compra') {
      const carData = {
        stand_id: stand.id,
        marca: formData.get('marca') as string,
        modelo: formData.get('modelo') as string,
        ano: formData.get('ano') ? parseInt(formData.get('ano') as string) : null,
        matricula: formData.get('matricula') as string || null,
        imagens: uploadedFotos,
        status: 'negociacao',
        lead_id: insertedLead.id,
        created_at: new Date().toISOString(),
        descricao: formData.get('informacoes_adicionais') as string || null,
      }
      
      const { data: carro } = await supabase.from('carros').insert(carData).select().single()
      
      if (carro) {
        await supabase.from('leads').update({ 
          carros_interesse: [carro.id] 
        }).eq('id', insertedLead.id)
      }
    }
  }

  revalidatePath('/admin/leads')
  return { success: 'Pedido enviado com sucesso! Entraremos em contacto em breve.' }
}
