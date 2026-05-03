import Link from 'next/link';
import { Stand } from '@/utils/tenant';
import { ModernNavbar } from './Navbar';
import { ModernFooter } from './Footer';
import { ModernCarCard, Car } from './CarCard';

interface ModernHomeProps {
  stand: Stand;
  recentCars: Car[];
}

export function ModernHome({ stand, recentCars }: ModernHomeProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ModernNavbar stand={stand} />

      <main>
        {/* Hero Section (Stitch Luxe Auto Design) */}
        <section className="bg-white pt-32 pb-20 overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-8 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-8">
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                Bem-vindo ao {stand.nome}
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Encontre o carro <br/> dos seus <span className="text-primary">sonhos</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-lg leading-relaxed">
                Temos um catálogo exclusivo de viaturas selecionadas com rigor, garantia de qualidade e as melhores condições de mercado.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/catalogo" className="bg-primary text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] transition-transform">
                  Explorar Catálogo
                </Link>
                <Link href="/contactos" className="bg-white text-slate-900 border border-slate-200 px-10 py-4 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                  Falar Connosco
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full relative">
              <div className="aspect-[4/3] rounded-[2.5rem] flex items-center justify-center overflow-hidden shadow-2xl">
                <img 
                  alt="Featured Car" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7_MK8HD_o5PU7LQXKKMru6R6ZjSAxgAyoGWbpqY8Lqwp0GIhPi2QxghnJXW5jPmYCA3RkiHUlRt9hBqJHEr_PUD-euHEMilNJhu7pd-1pfnYC6LgXivrewlkIrtmwe7bGNbznbtxuaNsf3PYsNMfC_OqVz11Ghrqxdj9Dk_Upyn-296-B0vjPJNQvbCSCk9vvto_M_X4EHJyNCaYifFe2mfA2Rn11c514XwT_77N8rujSEqLq_a0Be2kyA5YnsZ-z8OLTKjy4fmDB"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Partner Logos (Stitch Design) */}
        <section className="py-16 border-y border-slate-200 bg-white">
          <div className="max-w-[1280px] mx-auto px-8 flex justify-between items-center opacity-40 grayscale filter gap-8 flex-wrap">
            <span className="text-xl font-bold tracking-widest">PORSCHE</span>
            <span className="text-xl font-bold tracking-widest">MERCEDES-BENZ</span>
            <span className="text-xl font-bold tracking-widest">BMW</span>
            <span className="text-xl font-bold tracking-widest">AUDI</span>
            <span className="text-xl font-bold tracking-widest">TESLA</span>
            <span className="text-xl font-bold tracking-widest">LEXUS</span>
          </div>
        </section>

        {/* Recent Arrivals (Stitch Inventory Layout) */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-[1280px] mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Novidades em Stock</h2>
              <Link href="/catalogo" className="text-primary font-bold flex items-center gap-2 hover:underline">
                Ver todo o stock 
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentCars.length > 0 ? (
                recentCars.map(car => <ModernCarCard key={car.id} car={car} />)
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-slate-400 font-bold">Nenhum veículo disponível de momento.</p>
                </div>
              )}
            </div>
          </div>
        </section>

      </main>

      <ModernFooter stand={stand} />
    </div>
  );
}
