'use client'

import { useState } from 'react'
import { subscribeNewsletter } from '@/app/actions/newsletter'

export function NewsletterForm({ standId }: { standId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(formData: FormData) {
    setStatus('loading')
    const result = await subscribeNewsletter(formData, standId)
    
    if (result.error) {
      setStatus('error')
      setMessage(result.error)
    } else {
      setStatus('success')
      setMessage(result.success as string)
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white/10 border border-white/20 p-4 rounded-lg">
        <p className="text-white font-bold">{message}</p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full">
          <label htmlFor="email" className="block text-xs font-bold text-white mb-2 uppercase tracking-wider">
            Endereço de Email
          </label>
          <input 
            id="email"
            name="email"
            type="email"
            required
            className="w-full bg-transparent border-b border-slate-700 text-white p-2 focus:border-white transition-colors outline-none placeholder-slate-500" 
            placeholder="geral@exemplo.pt"
          />
        </div>
        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="bg-white text-black px-8 py-3 font-bold text-sm tracking-tight uppercase hover:bg-slate-200 transition-colors whitespace-nowrap disabled:opacity-50"
        >
          {status === 'loading' ? 'Aguarde...' : 'Subscrever'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-red-400 mt-2 text-sm">{message}</p>
      )}
    </form>
  )
}
