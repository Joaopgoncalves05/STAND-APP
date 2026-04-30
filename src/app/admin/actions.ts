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
}