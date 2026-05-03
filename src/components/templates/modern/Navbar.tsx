"use client";

import Link from 'next/link';
import { Stand } from '@/utils/tenant';
import { usePathname } from 'next/navigation';

interface ModernNavbarProps {
  stand: Stand;
}

export function ModernNavbar({ stand }: ModernNavbarProps) {
  const pathname = usePathname();

  const navLinkClass = (path: string) => {
    // For root, match exactly. For others, allow sub-paths like /catalogo/123
    const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);
    return `font-['Manrope'] text-sm font-medium tracking-tight uppercase transition-all pb-1 ${
      isActive 
        ? 'text-black border-b-2 border-black' 
        : 'text-slate-400 hover:text-black'
    }`;
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-[1280px] mx-auto flex justify-between items-center px-8 h-20">
        <Link href="/" className="flex items-center gap-2">
          {stand.logo_url ? (
            <img src={stand.logo_url} alt={stand.nome} className="h-10 object-contain" />
          ) : (
            <div className="text-2xl font-black tracking-tighter text-black uppercase" style={{ color: 'var(--color-primary)' }}>
              {stand.nome}
            </div>
          )}
        </Link>
        <nav className="hidden md:flex items-center gap-10">
          <Link className={navLinkClass("/catalogo")} href="/catalogo">Catálogo</Link>
          <Link className={navLinkClass("/sobre")} href="/sobre">Sobre Nós</Link>
          <Link className={navLinkClass("/contactos")} href="/contactos">Contactos</Link>
          <Link className={navLinkClass("/vender")} href="/vender">Vender o seu Carro</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/catalogo" className="bg-primary text-white px-6 py-3 font-['Manrope'] text-sm font-bold tracking-tight uppercase transition-all duration-300 hover:opacity-90 active:scale-[0.98]">
            Ver Veículos
          </Link>
          <button className="md:hidden p-2 text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
