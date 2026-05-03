import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getTenant } from '@/utils/tenant'
import Link from 'next/link'
import { deleteVehicle } from './actions'
import { BotaoApagar } from './btn-apagar'
import { getDashboardStats } from './dashboard-actions'

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
  const stand = await getTenant()

  const corPrimaria = stand?.cor_primaria || '#3b82f6'

  // 3. Dados Reais: Buscar Carros com filtro de pesquisa
  let carQuery = supabase
    .from('carros')
    .select('*')
    .eq('stand_id', stand?.id)
    .neq('status', 'negociacao') // Excluir viaturas em negociação de compra

  
  if (query) {
    carQuery = carQuery.ilike('modelo', `%${query}%`) // Pesquisa parcial insensível a maiúsculas
  }

  const { data: carros } = await carQuery.order('created_at', { ascending: false })

  // 4. Cálculos para os Stats
  const totalCarros = carros?.length || 0
  const valorTotal = carros?.reduce((acc, car) => acc + Number(car.preco), 0) || 0
  
  // 5. Dados Financeiros do Mês
  const statsFinanceiros = await getDashboardStats()

  return (
    <div className="p-6 md:p-10 font-sans">
      
      {/* HEADER & BRANDING */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Painel {stand?.nome}</h1>
            <p className="text-slate-500">Gestão de Inventário e Stock</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/admin/relatorios"
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl shadow-sm transition-all hover:bg-slate-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              Relatórios
            </Link>
            <Link 
              href="/admin/novo"
              className="flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: corPrimaria }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Novo Veículo
            </Link>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Activo</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{totalCarros} <span className="text-sm font-normal text-slate-400">viaturas</span></p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor de Stock</p>
            <p className="text-3xl font-black text-slate-900 mt-2">
              {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(valorTotal)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-[#e35a39] uppercase tracking-widest">Vendas do Mês</p>
            <p className="text-3xl font-black text-slate-900 mt-2">
              {statsFinanceiros?.numVendasMes || 0} <span className="text-sm font-normal text-slate-400">unid.</span>
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Margem Bruta (Mês)</p>
            <p className={`text-3xl font-black mt-2 ${ (statsFinanceiros?.margemMes || 0) >= 0 ? 'text-green-600' : 'text-red-600' }`}>
              {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(statsFinanceiros?.margemMes || 0)}
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
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                        {carro.imagens && carro.imagens.length > 0 ? (
                          <img src={carro.imagens[0]} alt={carro.modelo} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          {carro.marca} {carro.modelo}
                          {carro.status === 'vendido' && (
                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Vendido</span>
                          )}
                          {carro.status === 'reservado' && (
                            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Reservado</span>
                          )}
                          {carro.oculto && (
                            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Oculto</span>
                          )}

                        </div>
                        <div className="text-xs text-slate-500">{carro.ano}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">{carro.matricula}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(carro.preco)}
                  </td>
                  <td className="px-6 py-4 text-right">
  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <Link 
      href={`/admin/editar/${carro.id}/cartaz`}
      className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors flex items-center justify-center"
      title="Imprimir Cartaz"
      target="_blank"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
    </Link>
    <Link 
      href={`/admin/editar/${carro.id}`}
      className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors flex items-center justify-center"
      title="Editar"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
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