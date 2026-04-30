'use client'

import { deleteVehicle } from './actions'

export function BotaoApagar({ id }: { id: string }) {
  return (
    <form action={deleteVehicle}>
      <input type="hidden" name="id" value={id} />
      <button 
        type="submit"
        onClick={(e) => {
          if (!confirm('Tens a certeza que queres eliminar esta viatura?')) {
            e.preventDefault()
          }
        }}
        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
      >
        Apagar
      </button>
    </form>
  )
}