'use client'

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="bg-black text-white px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-slate-800"
    >
      Imprimir Cartaz
    </button>
  )
}
