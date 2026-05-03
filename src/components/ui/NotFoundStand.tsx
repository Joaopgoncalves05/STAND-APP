export function NotFoundStand() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full text-center bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
        <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-2xl mx-auto flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-4">Stand Não Encontrado</h1>
        <p className="text-slate-500 mb-8">
          Não foi possível encontrar um stand associado a este domínio. Verifique o endereço ou crie a sua conta na plataforma.
        </p>
        <a href="https://standapp.pt" className="inline-block px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
          Saber mais sobre o StandApp
        </a>
      </div>
    </div>
  );
}
