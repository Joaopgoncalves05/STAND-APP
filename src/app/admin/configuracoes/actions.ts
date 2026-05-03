'use server'

import { createClient } from '@/utils/supabase/server'
import { getTenant } from '@/utils/tenant'
import { revalidatePath } from 'next/cache'

export async function updateStandConfig(data: {
  nome: string
  cor_primaria: string
  comissao_tipo: 'fixo' | 'percentagem'
  comissao_valor: number
}) {
  const supabase = await createClient()
  const stand = await getTenant()
  if (!stand) return { error: 'Stand não encontrado' }

  const { error } = await supabase
    .from('stands')
    .update({
      nome: data.nome,
      cor_primaria: data.cor_primaria,
      comissao_tipo: data.comissao_tipo,
      comissao_valor: data.comissao_valor,
      updated_at: new Date().toISOString()
    })
    .eq('id', stand.id)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/admin/configuracoes')
  return { success: true }
}
