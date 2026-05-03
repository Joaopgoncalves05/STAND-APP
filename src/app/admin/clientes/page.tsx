import { createClient } from '@/utils/supabase/server'
import { getTenant } from '@/utils/tenant'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const TIPO_CONFIG: Record<string, { label: string; color: string }> = {
  prospect: { label: 'Prospect', color: 'bg-slate-100 text-slate-500' },
  recorrente: { label: 'Recorrente', color: 'bg-green-100 text-green-700' },
  vip: { label: 'VIP', color: 'bg-yellow-100 text-yellow-700' },
  inativo: { label: 'Inativo', color: 'bg-red-100 text-red-500' },
}

export default async function ClientesPage() {
  const supabase = await createClient()
  const stand = await getTenant()

  if (!stand) redirect('/login')

  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .eq('stand_id', stand.id)
    .order('nome', { ascending: true })

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight">Base de Dados de Clientes</h1>
        <p className="text-slate-500">Clientes convertidos e contactos frequentes.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">NIF</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clientes?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-light italic">
                  Ainda não existem clientes registados.
                </td>
              </tr>
            )}
            {clientes?.map((cliente) => {
              const tipo = TIPO_CONFIG[cliente.tipo_cliente || 'prospect'] || TIPO_CONFIG.prospect
              return (
                <tr key={cliente.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                        {(cliente.nome || 'C').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900">{cliente.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{cliente.email}</div>
                    <div className="text-xs text-slate-400">{cliente.telemovel}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${tipo.color}`}>
                      {tipo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{cliente.nif || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/clientes/${cliente.id}`}
                      className="text-xs font-bold text-slate-400 hover:text-[#e35a39] uppercase tracking-widest transition-colors group-hover:text-[#e35a39]"
                    >
                      Ver Perfil →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
