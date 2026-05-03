'use client';

import Link from 'next/link';
import { Stand } from '@/utils/tenant';
import { logout } from './actions';
import { useRouter } from 'next/navigation';

export function AdminHeader({ stand }: { stand: Stand }) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left Side: Logo & Title */}
        <div className="flex items-center gap-4">
          {stand.logo_url ? (
            <img src={stand.logo_url} alt={stand.nome} className="h-8 object-contain" />
          ) : (
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs"
              style={{ backgroundColor: stand.cor_primaria || '#3b82f6' }}
            >
              {stand.nome.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>
          
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="/admin" 
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-black rounded-lg hover:bg-slate-50 transition-all"
            >
              Inventário
            </Link>
            <Link 
              href="/admin/leads" 
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-black rounded-lg hover:bg-slate-50 transition-all"
            >
              Leads
            </Link>
            <Link 
              href="/admin/aquisicoes" 
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-black rounded-lg hover:bg-slate-50 transition-all"
            >
              Aquisições
            </Link>
            <Link 
              href="/admin/clientes" 
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-black rounded-lg hover:bg-slate-50 transition-all"
            >
              Clientes
            </Link>
            <Link 
              href="/admin/relatorios" 
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-black rounded-lg hover:bg-slate-50 transition-all"
            >
              Relatórios
            </Link>
          </nav>
        </div>

        {/* Right Side: Settings & Logout */}
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/configuracoes" 
            className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="hidden sm:inline">Definições</span>
          </Link>
          <div className="h-4 w-px bg-slate-200"></div>
          
          <button 
            onClick={handleLogout}
            className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
