'use client'

import { useState } from 'react'
import { submitLead } from '@/app/actions/leads'

interface CarContactFormProps {
  carroId: string
  carroNome: string
}

export function CarContactForm({ carroId, carroNome }: CarContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    // Composição da mensagem: prefixo do anúncio + mensagem do utilizador
    const userMessage = (formData.get('mensagem') as string || '').trim()
    const mensagemFinal = userMessage
      ? `[Interesse: ${carroNome}] ${userMessage}`
      : `Interesse no veículo: ${carroNome}`

    formData.set('tipo', 'contacto')
    formData.set('carro_id', carroId)
    formData.set('fonte', 'website')
    formData.set('mensagem', mensagemFinal)


    const result = await submitLead(formData)

    setIsSubmitting(false)
    if (result.success) {
      setSuccess(result.success)
      ;(e.target as HTMLFormElement).reset()
    } else {
      setError(result.error || 'Erro ao enviar mensagem')
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-bold text-white mb-1">Mensagem Enviada!</p>
        <p className="text-zinc-400 text-sm mb-6">{success}</p>
        <button
          onClick={() => setSuccess(null)}
          className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-widest transition-colors"
        >
          Enviar outra mensagem
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/30 border border-red-700 p-3 rounded-lg text-red-400 text-xs">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2 tracking-widest">Nome *</label>
        <input
          name="nome"
          required
          type="text"
          placeholder="O seu nome"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 px-4 text-white outline-none focus:border-[#e35a39] transition-all placeholder:text-zinc-600"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2 tracking-widest">E-mail *</label>
        <input
          name="email"
          required
          type="email"
          placeholder="email@exemplo.com"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 px-4 text-white outline-none focus:border-[#e35a39] transition-all placeholder:text-zinc-600"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2 tracking-widest">Telemóvel</label>
        <input
          name="telemovel"
          type="tel"
          placeholder="+351 000 000 000"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 px-4 text-white outline-none focus:border-[#e35a39] transition-all placeholder:text-zinc-600"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2 tracking-widest">Mensagem</label>
        <textarea
          name="mensagem"
          rows={3}
          placeholder="Gostaria de saber mais sobre..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 px-4 text-white outline-none focus:border-[#e35a39] transition-all placeholder:text-zinc-600 resize-none"
        />
      </div>
      <button
        disabled={isSubmitting}
        type="submit"
        className="w-full bg-white text-black py-4 text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-200 active:scale-95 disabled:bg-zinc-700 disabled:text-zinc-500 transition-all"
      >
        {isSubmitting ? 'A enviar...' : 'Enviar Mensagem'}
      </button>
    </form>
  )
}
