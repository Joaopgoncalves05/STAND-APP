'use client'

import { useState } from 'react'
import { confirmAcquisition } from '../leads/actions'

export function BotaoConfirmarCompra({ id, cor }: { id: string, cor: string }) {
  const [isPending, setIsPending] = useState(false)

  const handleConfirm = async () => {
    const price = prompt('Indique o valor final de compra desta viatura (€):')
    if (price === null) return // Cancelled
    
    const numPrice = parseFloat(price.replace(',', '.'))
    if (isNaN(numPrice) || numPrice <= 0) {
      alert('Por favor insira um valor válido.')
      return
    }

    if (!confirm(`Confirmar aquisição por €${numPrice.toLocaleString('pt-PT')}? A viatura passará para o inventário disponível.`)) return
    
    setIsPending(true)
    try {
      const res = await confirmAcquisition(id, numPrice)
      if (res?.error) {
        alert(res.error)
      }
    } catch (err) {
      alert('Erro ao confirmar compra. Tente novamente.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={isPending}
      className="px-6 py-3 text-white font-black rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
      style={{ backgroundColor: cor }}
    >
      {isPending ? (
        <>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          A processar...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Confirmar Compra
        </>
      )}
    </button>
  )
}
