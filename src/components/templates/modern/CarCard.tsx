import Link from 'next/link';
import { CompareButton } from '@/components/ui/CompareButton';
import { CarImageCarousel } from '@/components/ui/CarImageCarousel';

export interface Car {
  id: string;
  marca: string;
  modelo: string;
  ano: number | null;
  km: number | null;
  combustivel: string | null;
  preco: number | null;
  transmissao: string | null;
  imagens?: string[];
  vendido?: boolean;
  [key: string]: any;
}

interface ModernCarCardProps {
  car: Car;
}

export function ModernCarCard({ car }: ModernCarCardProps) {
  return (
    <div className="relative group">
      <Link href={`/carro/${car.id}`} className="block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
        <CarImageCarousel imagens={car.imagens} altTitle={`${car.marca} ${car.modelo}`} />
        
        {car.vendido && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-red-600 text-white font-black text-xl px-6 py-2 rounded-xl shadow-lg rotate-[-15deg] uppercase tracking-widest border-4 border-red-500">
              Vendido
            </span>
          </div>
        )}

        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm z-20">
          {car.ano}
        </div>
      </div>
      
      <div className="p-6 relative">
        <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
          {car.marca} {car.modelo}
        </h3>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            {car.combustivel}
          </span>
          <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {car.km?.toLocaleString('pt-PT') || '0'} km
          </span>
          <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            {car.transmissao || 'Manual'}
          </span>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className={`text-2xl font-black ${car.vendido ? 'text-slate-400 line-through decoration-red-500/50' : 'text-slate-900'}`}>
            {car.preco ? new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(car.preco) : 'Sob consulta'}
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </div>
        </div>
      </div>
      </Link>
      <CompareButton carId={car.id} />
    </div>
  );
}
