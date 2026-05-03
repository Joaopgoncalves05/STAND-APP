import { getTenant } from '@/utils/tenant'
import { ConfigClient } from './ConfigClient'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ConfiguracoesPage() {
  const stand = await getTenant()
  if (!stand) redirect('/login')

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <ConfigClient stand={stand} />
    </div>
  )
}
