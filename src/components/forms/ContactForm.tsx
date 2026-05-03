'use client'

import { useState } from 'react'
import { submitLead } from '@/app/actions/leads'

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    formData.append('tipo', 'contacto')
    
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
      <div className="bg-green-50 border border-green-200 p-8 rounded-3xl text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-green-900 mb-2">Mensagem Enviada!</h3>
        <p className="text-green-700">{success}</p>
        <button 
          onClick={() => setSuccess(null)}
          className="mt-8 text-sm font-bold text-green-900 uppercase tracking-widest hover:underline"
        >
          Enviar outra mensagem
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Nome</label>
        <input 
          name="nome"
          required
          className="w-full border border-slate-200 bg-white px-5 py-4 rounded-xl focus:ring-1 focus:ring-black focus:border-black outline-none transition-all" 
          placeholder="O seu nome completo" 
          type="text" 
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Email</label>
        <input 
          name="email"
          required
          className="w-full border border-slate-200 bg-white px-5 py-4 rounded-xl focus:ring-1 focus:ring-black focus:border-black outline-none transition-all" 
          placeholder="email@exemplo.com" 
          type="email" 
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Telefone</label>
        <input 
          name="telemovel"
          className="w-full border border-slate-200 bg-white px-5 py-4 rounded-xl focus:ring-1 focus:ring-black focus:border-black outline-none transition-all" 
          placeholder="+351 000 000 000" 
          type="tel" 
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Mensagem</label>
        <textarea 
          name="mensagem"
          required
          className="w-full border border-slate-200 bg-white px-5 py-4 rounded-xl focus:ring-1 focus:ring-black focus:border-black outline-none transition-all" 
          placeholder="Como podemos ajudar?" 
          rows={5}
        ></textarea>
      </div>
      <button 
        disabled={isSubmitting}
        className="w-full bg-black text-white font-bold text-sm py-5 rounded-xl hover:bg-[#e35a39] disabled:bg-slate-300 active:scale-[0.98] transition-all uppercase tracking-widest mt-4" 
        type="submit"
      >
        {isSubmitting ? 'A enviar...' : 'Enviar Mensagem'}
      </button>
    </form>
  )
}
