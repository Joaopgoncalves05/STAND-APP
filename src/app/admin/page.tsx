import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { deleteVehicle } from './actions'
import { BotaoApagar } from './btn-apagar'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createClient()
  const query = (await searchParams).q || ''

  // 1. Segurança: Verificar User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Branding: Buscar dados do Stand pelo domínio
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost'
  const { data: stand } = await supabase
    .from('stands')
    .select('*')
    .eq('dominio', host)
    .single()

  const corPrimaria = stand?.cor_primaria || '#3b82f6'

  // 3. Dados Reais: Buscar Carros com filtro de pesquisa
  let carQuery = supabase
    .from('carros')
    .select('*')
    .eq('stand_id', stand?.id) // Garante que só vê os carros do seu stand (Multitenancy)
  
  if (query) {
    carQuery = carQuery.ilike('modelo', `%${query}%`) // Pesquisa parcial insensível a maiúsculas
  }

  const { data: carros } = await carQuery.order('created_at', { ascending: false })

  // 4. Cálculos para os Stats
  const totalCarros = carros?.length || 0
  const valorTotal = carros?.reduce((acc, car) => acc + Number(car.preco), 0) || 0

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      
      {/* HEADER & BRANDING */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Painel {stand?.nome}</h1>
            <p className="text-slate-500">Gestão de Inventário e Stock</p>
          </div>
          
          <Link 
    href="/admin/novo"
    className="flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105"
    style={{ backgroundColor: corPrimaria }}
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
    Novo Veículo
  </Link>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total em Stock</p>
            <p className="text-4xl font-black text-slate-900 mt-2">{totalCarros} <span className="text-lg font-normal text-slate-400">viaturas</span></p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor do Inventário</p>
            <p className="text-4xl font-black text-slate-900 mt-2">
              {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(valorTotal)}
            </p>
          </div>
        </div>

        {/* BARRA DE PESQUISA (Funcional via URL) */}
        <div className="mb-6">
          <form method="GET" className="relative max-w-md">
            <input 
              name="q"
              defaultValue={query}
              placeholder="Pesquisar modelo..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 bg-white transition-all shadow-sm"
              style={{ '--tw-ring-color': corPrimaria } as any}
            />
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </form>
        </div>

        {/* TABELA DE CARROS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="px-6 py-4">Veículo</th>
                <th className="px-6 py-4">Matrícula</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {carros?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400">Nenhum veículo encontrado.</td>
                </tr>
              )}
              {carros?.map((carro) => (
                <tr key={carro.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{carro.marca} {carro.modelo}</div>
                    <div className="text-xs text-slate-500">{carro.ano}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">{carro.matricula}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(carro.preco)}
                  </td>
                  <td className="px-6 py-4 text-right">
  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <Link 
      href={`/admin/editar/${carro.id}`}
      className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
    >
      Editar
    </Link>
    
    {/* Botão Apagar com confirmação simples */}
    <BotaoApagar id={carro.id} />
  </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}