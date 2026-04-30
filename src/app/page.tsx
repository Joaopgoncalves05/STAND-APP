import { createClient } from '@/utils/supabase/server'

export default async function Page() {
  const supabase = await createClient() // Corrigido: adicionado await

  // Se o erro 2554 persistir no createClient(), 
  // garante que o teu utils/supabase/server.ts não pede argumentos.

  const { data: todos } = await supabase
    .from('todos')
    .select()

  return (
    <pre>
      {JSON.stringify(todos, null, 2)}
    </pre>
  )
}