import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { login } from './actions'

export default async function LoginPage() {
  // 1. Detetar o domínio (hostname)
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost'

  // 2. Ir ao Supabase buscar o stand pelo domínio
  const supabase = await createClient()
  const { data: stand } = await supabase
    .from('stands')
    .select('*')
    .eq('dominio', host)
    .single()

  // 3. Definir cores padrão caso o stand não seja encontrado
  const corPrimaria = stand?.cor_primaria || '#3b82f6' // Azul padrão
  const nomeStand = stand?.nome || 'Gestão de Stand'

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 font-sans">
      {/* Círculo de luz no fundo com a cor do stand */}
      <div 
        className="absolute w-96 h-96 opacity-20 blur-[120px] rounded-full"
        style={{ backgroundColor: corPrimaria }}
      ></div>

      <form className="relative z-10 w-full max-w-sm p-8 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">{nomeStand}</h1>
        <p className="text-slate-400 text-sm text-center mb-8 uppercase tracking-widest">Acesso Administrativo</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email</label>
            <input name="email" type="email" required className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2" style={{ '--tw-ring-color': corPrimaria } as any} />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Password</label>
            <input name="password" type="password" required className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2" style={{ '--tw-ring-color': corPrimaria } as any} />
          </div>

          <button 
            formAction={login} 
            className="w-full py-3 px-4 text-white font-bold rounded-lg transition duration-300 transform hover:scale-[1.02]"
            style={{ backgroundColor: corPrimaria }}
          >
            Entrar no Sistema
          </button>
        </div>
      </form>
    </div>
  )
}
