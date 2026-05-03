import { createClient } from '@/utils/supabase/server'
import { getTenant } from '@/utils/tenant'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LeadsKanban } from './LeadsKanban'

export default async function LeadsPage() {
  const supabase = await createClient()
  const stand = await getTenant()

  const { data: { user } } = await supabase.auth.getUser()
  if (!stand || !user) redirect('/login')

  // Fetch leads com dados do cliente linkado
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('*, clientes(id, nome, email, telemovel, tipo_cliente, tags)')
    .eq('stand_id', stand.id)
    .order('created_at', { ascending: false })

  if (leadsError) {
    console.error('Erro ao procurar leads:', leadsError)
  }

  // Fetch sellers/members for assignment
  const { data: sellers } = await supabase
    .from('membros_stand')
    .select('user_id, nome')
    .eq('stand_id', stand.id)

  // Fetch todos os carros (para o modal Ganha no Kanban)
  const { data: todosCarros } = await supabase
    .from('carros')
    .select('*')
    .eq('stand_id', stand.id)
    .eq('vendido', false)
    .order('marca', { ascending: true })


  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Gestão de Leads</h1>
          <p className="text-slate-500">Acompanhe o funil de vendas e oportunidades.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>{leads?.length || 0} leads no total</span>
          <Link href="/admin/leads/nova" className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#e35a39]">
            + Nova Lead
          </Link>
        </div>
      </div>

      <LeadsKanban 
        initialLeads={leads || []} 
        sellers={sellers || []} 
        todosCarros={todosCarros || []}
        currentUserId={user.id}
      />
    </div>
  )
}
