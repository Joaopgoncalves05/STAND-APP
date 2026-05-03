import { getRelatorioMensal } from './actions'
import { RelatoriosClient } from './RelatoriosClient'

export const dynamic = 'force-dynamic'

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; ano?: string }>
}) {
  const params = await searchParams
  const hoje = new Date()
  const ano = params.ano ? parseInt(params.ano) : hoje.getFullYear()
  const mes = params.mes ? parseInt(params.mes) : hoje.getMonth() + 1

  const relatorio = await getRelatorioMensal(ano, mes)

  return <RelatoriosClient relatorio={relatorio} ano={ano} mes={mes} />
}
