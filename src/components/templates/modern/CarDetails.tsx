import { Stand } from '@/utils/tenant';
import { ModernNavbar } from './Navbar';
import { ModernFooter } from './Footer';
import { Car } from './CarCard';
import { CarContactForm } from '@/components/forms/CarContactForm';

interface ModernCarDetailsProps {
  stand: Stand;
  car: Car;
}

export function ModernCarDetails({ stand, car }: ModernCarDetailsProps) {
  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen flex flex-col font-['Manrope'] antialiased">
      <ModernNavbar stand={stand} />

      <main className="mt-24 pb-20 flex-1">
        <section className="max-w-[1280px] mx-auto px-8 pt-10">
          
          {/* Breadcrumb - Added to integrate nicely with Next.js */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 font-bold uppercase tracking-widest">
            <a href="/" className="hover:text-black transition-colors">Início</a>
            <span>/</span>
            <a href="/catalogo" className="hover:text-black transition-colors">Catálogo</a>
            <span>/</span>
            <span className="text-black">{car.marca} {car.modelo}</span>
          </div>

          {/* Hero Section */}
          <div className="relative group overflow-hidden rounded-2xl mb-12">
            {/* If we have images, show the first one or the gallery. Let's adapt it to use ImageGallery but styled or just the first image for the hero */}
            {car.imagens && car.imagens.length > 0 ? (
              <img src={car.imagens[0]} alt={`${car.marca} ${car.modelo}`} className="w-full aspect-[21/9] object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="w-full aspect-[21/9] bg-stone-200"></div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-12">
              <div className="w-full flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">{car.marca} {car.modelo}</h1>
                  <p className="text-lg text-white/80">{car.ano} | {car.km?.toLocaleString('pt-PT') || '0'} km | {car.combustivel}</p>
                </div>
                <div className="text-right">
                  <span className={`block text-4xl font-black text-white mb-4 tracking-tight ${car.vendido ? 'line-through decoration-red-500/50' : ''}`}>
                    {car.preco ? new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(car.preco) : 'Sob consulta'}
                  </span>
                  <a href={`mailto:geral@${stand.dominio}?subject=Test Drive: ${car.marca} ${car.modelo} (${car.matricula})`} className={`inline-block px-10 py-4 text-sm font-bold tracking-widest uppercase rounded-lg transition-colors ${car.vendido ? 'bg-red-500 text-white pointer-events-none' : 'bg-white text-black hover:bg-zinc-200'}`}>
                    {car.vendido ? 'VENDIDO' : 'Agendar Test Drive'}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column */}
            <div className="lg:col-span-8">
              
              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="bg-white border border-gray-100 p-6 rounded-xl flex flex-col items-center text-center">
                  <svg className="w-8 h-8 text-[#e35a39] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-xs font-bold text-secondary uppercase mb-1 tracking-widest">Ano</span>
                  <span className="text-2xl font-bold">{car.ano}</span>
                </div>
                <div className="bg-white border border-gray-100 p-6 rounded-xl flex flex-col items-center text-center">
                  <svg className="w-8 h-8 text-[#e35a39] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v8l9-11h-7z" /></svg>
                  <span className="text-xs font-bold text-secondary uppercase mb-1 tracking-widest">Quilómetros</span>
                  <span className="text-2xl font-bold">{car.km?.toLocaleString('pt-PT') || '0'} km</span>
                </div>
                <div className="bg-white border border-gray-100 p-6 rounded-xl flex flex-col items-center text-center">
                  <svg className="w-8 h-8 text-[#e35a39] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  <span className="text-xs font-bold text-secondary uppercase mb-1 tracking-widest">Combustível</span>
                  <span className="text-2xl font-bold">{car.combustivel}</span>
                </div>
                <div className="bg-white border border-gray-100 p-6 rounded-xl flex flex-col items-center text-center">
                  <svg className="w-8 h-8 text-[#e35a39] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-xs font-bold text-secondary uppercase mb-1 tracking-widest">Transmissão</span>
                  <span className="text-2xl font-bold">{car.transmissao}</span>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6 border-l-4 border-black pl-6">Descrição do Veículo</h2>
                  <div className="text-base text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {car.descricao || "Nenhuma descrição detalhada disponível para esta viatura."}
                  </div>
                </div>

                <div className="bg-[#eeeeee] p-8 rounded-2xl">
                  <h2 className="text-2xl font-bold mb-6">Especificações Técnicas</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-stone-500 font-bold">Potência</span>
                      <span className="text-black font-black">{car.potencia_cavalos ? `${car.potencia_cavalos} cv` : 'N/D'}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-stone-500 font-bold">Cilindrada</span>
                      <span className="text-black font-black">{car.cilindrada ? `${car.cilindrada} cc` : 'N/D'}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-stone-500 font-bold">Segmento</span>
                      <span className="text-black font-black">{car.segmento || 'N/D'}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-stone-500 font-bold">Portas</span>
                      <span className="text-black font-black">{car.portas || 'N/D'}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-stone-500 font-bold">Lotação</span>
                      <span className="text-black font-black">{car.lotacao ? `${car.lotacao} lugares` : 'N/D'}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-stone-500 font-bold">Tração</span>
                      <span className="text-black font-black">{car.tracao || 'N/D'}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-stone-500 font-bold">Garantia</span>
                      <span className="text-black font-black">{car.garantia || 'N/D'}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-stone-500 font-bold">Origem</span>
                      <span className="text-black font-black">{car.origem || 'N/D'}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-stone-500 font-bold">Cor Exterior</span>
                      <span className="text-black font-black">{car.cor_exterior || 'N/D'}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-stone-500 font-bold">Cor Interior</span>
                      <span className="text-black font-black">{car.cor_interior || 'N/D'}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-stone-500 font-bold">Estofos</span>
                      <span className="text-black font-black">{car.estofos || 'N/D'}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-stone-500 font-bold">Importado</span>
                      <span className="text-black font-black">{car.importado ? 'Sim' : 'Não'}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Images from the Gallery */}
                {car.imagens && car.imagens.length > 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    {car.imagens.slice(1, 3).map((img, idx) => (
                      <img key={idx} src={img} className="rounded-xl w-full h-64 object-cover" alt="Detalhe do Carro" />
                    ))}
                  </div>
                )}

              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-6">
                


                {/* Contact Card */}
                <div className="bg-black text-white p-8 rounded-2xl">
                  <h3 className="text-2xl font-bold mb-2">Falar com Consultor</h3>
                  <p className="text-zinc-400 mb-8 text-sm">Interessado neste veículo? A nossa equipa está disponível para o ajudar.</p>
                  
                  <CarContactForm
                    carroId={car.id}
                    carroNome={`${car.marca} ${car.modelo} (${car.ano})`}
                  />

                  <div className="mt-8 pt-8 border-t border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Consultor Luxe</p>
                        <p className="text-xs text-zinc-500">Gestor de Conta Premium</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors" href="tel:+351912345678">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>
      </main>

      <ModernFooter stand={stand} />
    </div>
  );
}
