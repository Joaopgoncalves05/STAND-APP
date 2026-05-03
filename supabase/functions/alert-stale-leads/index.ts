import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const STALE_HOURS = 48

Deno.serve(async (req: Request) => {
  // Allow manual triggers via GET/POST (e.g. from pg_cron or Supabase Scheduler)
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const staleThreshold = new Date(Date.now() - STALE_HOURS * 60 * 60 * 1000).toISOString()

    // Fetch all stale leads (not closed) that haven't been contacted recently
    // and haven't already been alerted in the past 24h
    const { data: staleLeads, error } = await supabaseAdmin
      .from('leads')
      .select(`
        id,
        nome,
        email,
        estado,
        stand_id,
        vendedor_id,
        ultimo_contacto,
        created_at,
        stands ( nome, dominio )
      `)
      .not('estado', 'in', '(ganha,perdida)')
      .or(`ultimo_contacto.lte.${staleThreshold},and(ultimo_contacto.is.null,created_at.lte.${staleThreshold})`)

    if (error) {
      console.error('Error fetching stale leads:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    if (!staleLeads || staleLeads.length === 0) {
      return new Response(JSON.stringify({ message: 'No stale leads found', processed: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log(`Found ${staleLeads.length} stale leads`)

    // Check which leads already have a recent stale alert (avoid spam)
    const leadIds = staleLeads.map((l: any) => l.id)
    const alertThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: recentAlerts } = await supabaseAdmin
      .from('lead_atividade')
      .select('lead_id')
      .in('lead_id', leadIds)
      .eq('tipo', 'alerta_estagnada')
      .gte('created_at', alertThreshold)

    const alreadyAlerted = new Set((recentAlerts ?? []).map((a: any) => a.lead_id))

    // Filter out leads that were already alerted in the past 24h
    const toAlert = staleLeads.filter((l: any) => !alreadyAlerted.has(l.id))

    if (toAlert.length === 0) {
      return new Response(JSON.stringify({ message: 'All stale leads already alerted today', processed: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Insert activity log entries for each stale lead
    const activityRows = toAlert.map((lead: any) => {
      const hoursSince = Math.floor(
        (Date.now() - new Date(lead.ultimo_contacto ?? lead.created_at).getTime()) / (1000 * 60 * 60)
      )
      return {
        lead_id: lead.id,
        stand_id: lead.stand_id,
        user_id: null, // System-generated
        user_nome: 'Sistema',
        tipo: 'alerta_estagnada',
        descricao: `⚠️ Lead sem actividade há ${hoursSince}h. Estado actual: ${lead.estado}. Contacta o cliente!`,
      }
    })

    const { error: insertError } = await supabaseAdmin
      .from('lead_atividade')
      .insert(activityRows)

    if (insertError) {
      console.error('Error inserting activity logs:', insertError)
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500 })
    }

    // Optional: Send email via Resend if RESEND_API_KEY is configured
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (resendKey) {
      // Group by vendedor for a single digest email per vendedor
      const byVendedor = new Map<string | null, any[]>()
      for (const lead of toAlert) {
        const key = lead.vendedor_id ?? '__unassigned__'
        if (!byVendedor.has(key)) byVendedor.set(key, [])
        byVendedor.get(key)!.push(lead)
      }

      // Fetch vendedor emails from auth.users (service role)
      const vendedorIds = [...byVendedor.keys()].filter((k) => k !== '__unassigned__')
      if (vendedorIds.length > 0) {
        for (const vendedorId of vendedorIds) {
          const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(vendedorId as string)
          if (!user?.email) continue

          const leadsForVendedor = byVendedor.get(vendedorId)!
          const leadsList = leadsForVendedor
            .map((l: any) => `• ${l.nome ?? l.email ?? 'Lead sem nome'} — ${l.estado}`)
            .join('\n')

          const standNome = leadsForVendedor[0]?.stands?.nome ?? 'Stand'

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: `${standNome} DMS <noreply@standapp.pt>`,
              to: [user.email],
              subject: `⚠️ ${leadsForVendedor.length} lead(s) estagnadas — ${standNome}`,
              text: `Tens ${leadsForVendedor.length} lead(s) sem actividade há mais de 48h:\n\n${leadsList}\n\nActualiza o estado destas leads no painel: https://${leadsForVendedor[0]?.stands?.dominio}/admin/leads`,
            }),
          })
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Stale lead alerts processed',
        alerted: toAlert.length,
        skipped: staleLeads.length - toAlert.length,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
