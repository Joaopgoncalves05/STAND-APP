 'use server'
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

// No ficheiro de actions
export async function deleteVehicle(formData: FormData) {
 
  const id = formData.get('id') as string
  const supabase = await createClient()

  const { error } = await supabase
    .from('carros')
    .delete()
    .eq('id', id)

  if (error) throw new Error("Erro ao apagar")
  
  revalidatePath('/admin') // Isto limpa a cache e atualiza a lista instantaneamente
  revalidatePath('/admin/aquisicoes')
}

export async function confirmPurchase(carId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('carros')
    .update({ 
      status: 'disponivel', 
      data_aquisicao: new Date().toISOString() 
    })
    .eq('id', carId)

  if (error) throw new Error("Erro ao confirmar compra: " + error.message)
  
  revalidatePath('/admin')
  revalidatePath('/admin/aquisicoes')
  revalidatePath('/admin/relatorios')
}


export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return { success: true }
}