'use server'

import { createClient } from '@/utils/supabase/server'
import { getTenant } from '@/utils/tenant'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getContexto(supabase: any, leadId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data: lead } = await supabase
    .from('leads')
    .select('stand_id, estado, prioridade, vendedor_id')
    .eq('id', leadId)
    .single()
  const userNome = user?.email || 'Sistema'
  return { user, lead, userNome }
}

type LogPayload = {
  lead_id: string; stand_id: string; user_id: string; user_nome: string; 
  tipo: string; descricao: string; campo?: string; valor_anterior?: string; valor_novo?: string
}

async function log(supabase: any, p: LogPayload) {
  await supabase.from('lead_atividade').insert(p)
}

const ESTADO_L: Record<string, string> = {
  nova: 'Nova', em_contacto: 'Em Contacto', test_drive: 'Test Drive',
  proposta: 'Proposta', ganha: 'Ganha', perdida: 'Perdida',
}
const PRIO_L: Record<string, string> = {
  baixa: 'Baixa', media: 'Média', alta: 'Alta', urgente: 'Urgente',
}

// ─── Estado ───────────────────────────────────────────────────────────────────

export async function updateLeadStatus(leadId: string, status: string) {
  const supabase = await createClient()
  const { user, lead, userNome } = await getContexto(supabase, leadId)

  const { error } = await supabase.from('leads')
    .update({ estado: status, updated_at: new Date().toISOString(), ultimo_contacto: new Date().toISOString() })
    .eq('id', leadId)
  if (error) return { error: 'Erro ao atualizar estado' }

  if (lead && user) {
    await log(supabase, {
      lead_id: leadId, stand_id: lead.stand_id, user_id: user.id, user_nome: userNome,
      tipo: 'estado', descricao: `Estado: "${ESTADO_L[lead.estado] || lead.estado}" → "${ESTADO_L[status] || status}"`,
      campo: 'estado', valor_anterior: lead.estado, valor_novo: status,
    })
  }

  revalidatePath('/admin/leads')
  revalidatePath(`/admin/leads/${leadId}`)
  return { success: true }
}

// ─── Fechar como GANHA ────────────────────────────────────────────────────────

export async function closeLeadGanha(
  leadId: string,
  valorTransacao: number,
  vendedorId: string,
  carroId?: string,
) {
  const supabase = await createClient()
  const { user, lead, userNome } = await getContexto(supabase, leadId)
  if (!lead || !user) return { error: 'Contexto inválido' }

  // Buscar tipo da lead
  const { data: leadTipoData } = await supabase
    .from('leads')
    .select('tipo')
    .eq('id', leadId)
    .single()
  
  const isCompra = leadTipoData?.tipo === 'compra'

  const updateData: Record<string, unknown> = {
    estado: 'ganha',
    valor_transacao: valorTransacao,
    updated_at: new Date().toISOString(),
    ultimo_contacto: new Date().toISOString(),
    data_followup: null,
  }
  if (vendedorId) updateData.vendedor_id = vendedorId
  if (carroId) updateData.carro_id = carroId

  const { error } = await supabase.from('leads').update(updateData).eq('id', leadId)
  if (error) return { error: 'Erro ao fechar lead' }

  // Buscar dados do cliente e do carro para registo financeiro
  const { data: leadFull } = await supabase
    .from('leads')
    .select('cliente_id, carro_id, stand_id')
    .eq('id', leadId)
    .single()

  const resolvedCarroId = carroId || leadFull?.carro_id

  // Promover cliente para recorrente
  if (leadFull?.cliente_id) {
    await supabase.from('clientes')
      .update({ tipo_cliente: 'recorrente', updated_at: new Date().toISOString() })
      .eq('id', leadFull.cliente_id)
  }

  // Lógica de Carro
  let precoCompra: number | null = null
  if (resolvedCarroId) {
    if (isCompra) {
      // Se a lead era de COMPRA, o carro agora entra em stock (disponível)
      // O valor da transação da lead é o preço de compra do stand
      await supabase.from('carros')
        .update({ 
          status: 'disponivel', 
          vendido: false, 
          preco_compra: valorTransacao,
          data_aquisicao: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq('id', resolvedCarroId)
      precoCompra = valorTransacao
    } else {
      // Se a lead era de VENDA, o carro sai de stock (vendido)
      const { data: carro } = await supabase
        .from('carros')
        .select('preco_compra')
        .eq('id', resolvedCarroId)
        .single()
      precoCompra = carro?.preco_compra ?? null

      await supabase.from('carros')
        .update({ vendido: true, status: 'vendido', updated_at: new Date().toISOString() })
        .eq('id', resolvedCarroId)
    }
  }

  // Buscar configuração de comissão do stand
  const { data: standData } = await supabase
    .from('stands')
    .select('comissao_tipo, comissao_valor')
    .eq('id', lead.stand_id)
    .single()

  // Calcular comissão (apenas em VENDA, em COMPRA a margem é 0 ou negativa por agora)
  let comissaoValor: number | null = null
  const margem = isCompra ? 0 : valorTransacao - (precoCompra ?? 0)
  
  if (!isCompra) {
    if (standData?.comissao_tipo === 'fixo') {
      comissaoValor = standData.comissao_valor ?? 0
    } else if (standData?.comissao_tipo === 'percentagem' && standData.comissao_valor) {
      comissaoValor = Math.round((margem * standData.comissao_valor) / 100 * 100) / 100
    }
  }

  // Criar registo na tabela de vendas (apenas se for venda)
  if (!isCompra) {
    await supabase.from('vendas').insert({
      stand_id: lead.stand_id,
      lead_id: leadId,
      carro_id: resolvedCarroId ?? null,
      cliente_id: leadFull?.cliente_id ?? null,
      vendedor_id: vendedorId || null,
      preco_venda: valorTransacao,
      preco_compra: precoCompra,
      comissao_tipo: standData?.comissao_tipo ?? 'fixo',
      comissao_valor: comissaoValor,
      data_venda: new Date().toISOString(),
    })
  } else {
    // Para COMPRA, podemos registar numa tabela de 'compras' se existir, 
    // ou apenas logar na atividade por agora.
  }

  // Log na atividade
  await log(supabase, {
    lead_id: leadId, stand_id: lead.stand_id, user_id: user.id, user_nome: userNome,
    tipo: 'estado',
    descricao: isCompra 
      ? `🏆 Aquisição concluída — Viatura comprada por €${valorTransacao.toLocaleString('pt-PT')}`
      : `🏆 Lead fechada como GANHA — €${valorTransacao.toLocaleString('pt-PT')} | Margem: €${margem.toLocaleString('pt-PT')}${comissaoValor !== null ? ` | Comissão: €${comissaoValor.toLocaleString('pt-PT')}` : ''}`,
    campo: 'estado', valor_anterior: lead.estado, valor_novo: 'ganha',
  })

  revalidatePath('/admin/leads')
  revalidatePath('/admin/aquisicoes')
  revalidatePath('/admin/relatorios')
  revalidatePath(`/admin/leads/${leadId}`)
  return { success: true }
}

// ─── Fechar como PERDIDA ──────────────────────────────────────────────────────

export async function closeLeadPerdida(leadId: string, motivo: string) {
  const supabase = await createClient()
  const { user, lead, userNome } = await getContexto(supabase, leadId)

  const { error } = await supabase.from('leads')
    .update({ estado: 'perdida', motivo_perda: motivo, data_followup: null, updated_at: new Date().toISOString() })
    .eq('id', leadId)
  if (error) return { error: 'Erro ao fechar lead' }

  if (lead && user) {
    await log(supabase, {
      lead_id: leadId, stand_id: lead.stand_id, user_id: user.id, user_nome: userNome,
      tipo: 'estado', descricao: `❌ Lead fechada como PERDIDA: "${motivo}"`,
      campo: 'estado', valor_anterior: lead.estado, valor_novo: 'perdida',
    })
  }

  revalidatePath('/admin/leads')
  revalidatePath(`/admin/leads/${leadId}`)
  return { success: true }
}

// ─── Prioridade ───────────────────────────────────────────────────────────────

export async function updateLeadPriority(leadId: string, prioridade: string) {
  const supabase = await createClient()
  const { user, lead, userNome } = await getContexto(supabase, leadId)

  const { error } = await supabase.from('leads')
    .update({ prioridade, updated_at: new Date().toISOString() })
    .eq('id', leadId)
  if (error) return { error: 'Erro ao atualizar prioridade' }

  if (lead && user) {
    await log(supabase, {
      lead_id: leadId, stand_id: lead.stand_id, user_id: user.id, user_nome: userNome,
      tipo: 'prioridade', descricao: `Prioridade: "${PRIO_L[lead.prioridade] || lead.prioridade}" → "${PRIO_L[prioridade] || prioridade}"`,
      campo: 'prioridade', valor_anterior: lead.prioridade, valor_novo: prioridade,
    })
  }

  revalidatePath('/admin/leads')
  revalidatePath(`/admin/leads/${leadId}`)
  return { success: true }
}

// ─── Vendedor ─────────────────────────────────────────────────────────────────

export async function assignLead(leadId: string, vendedorUserId: string) {
  const supabase = await createClient()
  const { user, lead, userNome } = await getContexto(supabase, leadId)

  const { error } = await supabase.from('leads')
    .update({ vendedor_id: vendedorUserId || null, updated_at: new Date().toISOString() })
    .eq('id', leadId)
  if (error) return { error: 'Erro ao atribuir vendedor' }

  if (lead && user) {
    await log(supabase, {
      lead_id: leadId, stand_id: lead.stand_id, user_id: user.id, user_nome: userNome,
      tipo: 'vendedor', descricao: vendedorUserId ? `Vendedor atribuído` : 'Vendedor removido',
    })
  }

  revalidatePath('/admin/leads')
  revalidatePath(`/admin/leads/${leadId}`)
  return { success: true }
}

// ─── Notas da Lead ────────────────────────────────────────────────────────────

export async function updateLeadNotes(leadId: string, notas: string) {
  const supabase = await createClient()
  const { user, lead, userNome } = await getContexto(supabase, leadId)

  const { error } = await supabase.from('leads')
    .update({ notas_internas: notas, updated_at: new Date().toISOString() })
    .eq('id', leadId)
  if (error) return { error: 'Erro ao guardar notas' }

  if (lead && user) {
    await log(supabase, {
      lead_id: leadId, stand_id: lead.stand_id, user_id: user.id, user_nome: userNome,
      tipo: 'nota', descricao: 'Notas internas actualizadas',
    })
  }

  revalidatePath('/admin/leads')
  revalidatePath(`/admin/leads/${leadId}`)
  return { success: true }
}

// ─── Valor ────────────────────────────────────────────────────────────────────

export async function updateValor(leadId: string, valor: number | null) {
  const supabase = await createClient()
  const { user, lead, userNome } = await getContexto(supabase, leadId)

  const { error } = await supabase.from('leads')
    .update({ valor_estimado: valor, updated_at: new Date().toISOString() })
    .eq('id', leadId)
  if (error) return { error: 'Erro ao atualizar valor' }

  if (lead && user) {
    await log(supabase, {
      lead_id: leadId, stand_id: lead.stand_id, user_id: user.id, user_nome: userNome,
      tipo: 'outro', descricao: `Valor atualizado para ${valor ? `€${valor.toLocaleString('pt-PT')}` : 'N/A'}`
    })
  }

  revalidatePath('/admin/leads')
  revalidatePath(`/admin/leads/${leadId}`)
  return { success: true }
}

// ─── Ligar Cliente ────────────────────────────────────────────────────────────

export async function linkClienteToLead(leadId: string) {
  const supabase = await createClient()
  const { user, lead, userNome } = await getContexto(supabase, leadId)

  const { error } = await supabase.rpc('upsert_cliente_from_lead', { p_lead_id: leadId })
  if (error) {
    console.error('Erro ao ligar cliente:', error)
    return { error: `Erro ao criar/ligar cliente: ${error.message}` }
  }

  if (lead && user) {
    await log(supabase, {
      lead_id: leadId, stand_id: lead.stand_id, user_id: user.id, user_nome: userNome,
      tipo: 'outro', descricao: 'Cliente criado/ligado manualmente',
    })
  }

  revalidatePath(`/admin/leads/${leadId}`)
  return { success: true }
}

// ─── Editar Cliente ───────────────────────────────────────────────────────────

type ClienteUpdateData = {
  nome?: string; email?: string; telemovel?: string; nif?: string
  data_nascimento?: string; morada?: string; cod_postal?: string
  localidade?: string; notas_internas?: string; tipo_cliente?: string
  consentimento_marketing?: boolean
}

export async function updateCliente(clienteId: string, leadId: string, data: ClienteUpdateData) {
  const supabase = await createClient()

  const { error } = await supabase.from('clientes')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', clienteId)
  if (error) return { error: 'Erro ao actualizar cliente' }

  const { user, lead, userNome } = await getContexto(supabase, leadId)
  if (lead && user) {
    await log(supabase, {
      lead_id: leadId, stand_id: lead.stand_id, user_id: user.id, user_nome: userNome,
      tipo: 'outro', descricao: 'Dados do cliente actualizados',
    })
  }

  revalidatePath(`/admin/leads/${leadId}`)
  revalidatePath(`/admin/clientes/${clienteId}`)
  return { success: true }
}

// ─── Viaturas de Interesse ────────────────────────────────────────────────────

export async function updateCarrosInteresse(leadId: string, carroIds: string[]) {
  const supabase = await createClient()
  const { user, lead, userNome } = await getContexto(supabase, leadId)

  const { error } = await supabase.from('leads')
    .update({ carros_interesse: carroIds, updated_at: new Date().toISOString() })
    .eq('id', leadId)
  if (error) return { error: 'Erro ao atualizar viaturas de interesse' }

  if (lead && user) {
    await log(supabase, {
      lead_id: leadId, stand_id: lead.stand_id, user_id: user.id, user_nome: userNome,
      tipo: 'outro', descricao: `Viaturas de interesse actualizadas (${carroIds.length} viatura${carroIds.length !== 1 ? 's' : ''})`,
    })
  }

  revalidatePath(`/admin/leads/${leadId}`)
  return { success: true }
}

// ─── Retoma ───────────────────────────────────────────────────────────────────

type RetomaData = {
  marca?: string; modelo?: string; ano?: string; km?: string
  matricula?: string; valor_retoma?: string; estado_viatura?: string; observacoes?: string
}

export async function updateDadosRetoma(leadId: string, dados: RetomaData | null) {
  const supabase = await createClient()
  const { user, lead, userNome } = await getContexto(supabase, leadId)

  const { error } = await supabase.from('leads')
    .update({ dados_retoma: dados, updated_at: new Date().toISOString() })
    .eq('id', leadId)
  if (error) return { error: 'Erro ao guardar retoma' }

  if (lead && user) {
    await log(supabase, {
      lead_id: leadId, stand_id: lead.stand_id, user_id: user.id, user_nome: userNome,
      tipo: 'outro', descricao: dados ? 'Viatura de retoma registada' : 'Viatura de retoma removida',
    })
  }

  revalidatePath(`/admin/leads/${leadId}`)
  return { success: true }
}

// ─── Criar Lead Manual ────────────────────────────────────────────────────────

export async function createLeadManual(formData: FormData) {
  const supabase = await createClient()
  const stand = await getTenant()
  if (!stand) return { error: 'Stand não encontrado' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const insertData = {
    stand_id: stand.id,
    nome: (formData.get('nome') as string) || null,
    email: (formData.get('email') as string) || null,
    telemovel: (formData.get('telemovel') as string) || null,
    cliente_id: (formData.get('cliente_id') as string) || null,
    tipo: formData.get('tipo') as string || 'contacto',
    fonte: formData.get('fonte') as string || 'presencial',
    mensagem: formData.get('mensagem') as string || null,
    prioridade: formData.get('prioridade') as string || 'media',
    estado: 'nova',
    vendedor_id: formData.get('vendedor_id') as string || null,
    valor_estimado: formData.get('valor_estimado') ? Number(formData.get('valor_estimado')) : null,
    carros_interesse: formData.get('carro_interesse_id') ? [formData.get('carro_interesse_id') as string] : null,
    created_at: new Date().toISOString(),
  }

  const { data: lead, error } = await supabase.from('leads').insert(insertData).select().single()
  if (error) return { error: 'Erro ao criar lead' }

  // Se for uma lead de aquisição (tipo 'compra' no esquema atual), criar a viatura de negociação
  const acqMarca = formData.get('acq_marca') as string
  if (insertData.tipo === 'compra' && acqMarca) {
    const acqData = {
      stand_id: stand.id,
      marca: acqMarca,
      modelo: formData.get('acq_modelo') as string,
      ano: formData.get('acq_ano') ? parseInt(formData.get('acq_ano') as string) : null,
      matricula: formData.get('acq_matricula') as string || null,
      km: formData.get('acq_km') ? parseInt(formData.get('acq_km') as string) : null,
      preco_compra: formData.get('acq_preco_compra') ? parseFloat(formData.get('acq_preco_compra') as string) : null,
      status: 'negociacao',
      lead_id: lead.id,
      created_at: new Date().toISOString(),
    }
    
    const { data: carro } = await supabase.from('carros').insert(acqData).select().single()
    
    // Se criou o carro, podemos associar o ID à lead se necessário (carros_interesse)
    if (carro) {
      await supabase.from('leads').update({ 
        carros_interesse: [carro.id] 
      }).eq('id', lead.id)
    }
  }

  // Auto-ligar cliente se for novo
  if (!insertData.cliente_id && (insertData.email || insertData.telemovel)) {
    await supabase.rpc('upsert_cliente_from_lead', { p_lead_id: lead.id })
  }

  // Log criação
  await supabase.from('lead_atividade').insert({
    lead_id: lead.id,
    stand_id: stand.id,
    user_id: user.id,
    user_nome: user.email,
    tipo: 'criacao',
    descricao: 'Lead criada manualmente',
  })

  revalidatePath('/admin/leads')
  revalidatePath('/admin/aquisicoes')
  redirect(`/admin/leads/${lead.id}`)
}

// ─── Viatura de Negociação ───────────────────────────────────────────────────

export async function addNegotiationVehicle(leadId: string, vehicleData: any) {
  const supabase = await createClient()
  const stand = await getTenant()
  if (!stand) return { error: 'Stand não encontrado' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const insertData = {
    ...vehicleData,
    stand_id: stand.id,
    status: 'negociacao',
    lead_id: leadId,
    created_at: new Date().toISOString(),
  }

  const { data: carro, error } = await supabase.from('carros').insert(insertData).select().single()
  if (error) return { error: 'Erro ao criar viatura: ' + error.message }

  // Log na atividade da lead
  await log(supabase, {
    lead_id: leadId, stand_id: stand.id, user_id: user.id, user_nome: user.email || 'Sistema',
    tipo: 'outro', 
    descricao: `Viatura de negociação adicionada: ${carro.marca} ${carro.modelo} (${carro.matricula || 'Sem matrícula'})`,
  })

  revalidatePath(`/admin/leads/${leadId}`)
  revalidatePath('/admin/aquisicoes')
  return { success: true, carro }
}

// ─── Confirmar Aquisição ─────────────────────────────────────────────────────

export async function confirmAcquisition(carId: string, purchasePrice: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // 1. Buscar a viatura e a lead associada
  const { data: carro, error: carError } = await supabase
    .from('carros')
    .select('id, lead_id, marca, modelo')
    .eq('id', carId)
    .single()
  
  if (carError || !carro) return { error: 'Viatura não encontrada' }

  // 2. Se houver lead, fechar como ganha usando a lógica centralizada
  if (carro.lead_id) {
    return await closeLeadGanha(carro.lead_id, purchasePrice, user.id, carro.id)
  }

  // 3. Se não houver lead (caso raro), apenas atualizar a viatura
  const { error: updateError } = await supabase
    .from('carros')
    .update({
      status: 'disponivel',
      preco_compra: purchasePrice,
      data_aquisicao: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', carId)

  if (updateError) return { error: 'Erro ao atualizar viatura' }

  revalidatePath('/admin/aquisicoes')
  revalidatePath('/admin')
  return { success: true }
}
