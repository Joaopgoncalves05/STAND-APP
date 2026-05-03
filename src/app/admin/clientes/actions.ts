'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateCliente(clienteId: string, data: any) {
  const supabase = await createClient()
  
  // Limpar os dados vazios (strings vazias passam a null)
  const cleanedData = { ...data }
  Object.keys(cleanedData).forEach(key => {
    if (cleanedData[key] === '') cleanedData[key] = null
  })

  // Garantir que veiculo_atual é JSON compatível se tiver dados vazios
  if (cleanedData.veiculo_atual) {
    let hasData = false
    Object.keys(cleanedData.veiculo_atual).forEach(key => {
      if (cleanedData.veiculo_atual[key] === '') cleanedData.veiculo_atual[key] = null
      if (cleanedData.veiculo_atual[key] !== null) hasData = true
    })
    if (!hasData) cleanedData.veiculo_atual = null
  }

  const { error } = await supabase
    .from('clientes')
    .update(cleanedData)
    .eq('id', clienteId)

  if (error) {
    console.error('Erro ao atualizar cliente:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/admin/clientes/${clienteId}`)
  revalidatePath(`/admin/clientes`)
  return { success: true }
}
