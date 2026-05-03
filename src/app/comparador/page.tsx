import { getTenant } from '@/utils/tenant'
import { createClient } from '@/utils/supabase/server'
import { NotFoundStand } from '@/components/ui/NotFoundStand'
import { ModernNavbar } from '@/components/templates/modern/Navbar'
import { ModernFooter } from '@/components/templates/modern/Footer'
import { CarImageCarousel } from '@/components/ui/CarImageCarousel'
import Link from 'next/link'

export default async function ComparadorPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const stand = await getTenant()

  if (!stand) {
    return <NotFoundStand />
  }

  const resolvedParams = await searchParams
  const idsParam = resolvedParams.ids

  if (!idsParam) {
    return (
      <div className="bg-[#f9f9f9] text-[#1b1b1b] min-h-screen flex flex-col font-['Manrope'] antialiased">
        <ModernNavbar stand={stand} />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-24">
          <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm border border-[#f1f5f9] flex items-center justify-center text-[#64748b] mb-8">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 16l-3-9m-9 11v-5m0 0L8 7m4 4l4-4" /></svg>
          </div>
          <h1 className="text-4xl font-black text-black mb-4 tracking-tight">Nenhuma viatura selecionada</h1>
          <p className="text-lg text-[#64748b] mb-10 max-w-md leading-relaxed">Para comparar viaturas, vá ao catálogo e clique no ícone de balanças no canto superior direito de cada viatura.</p>
          <Link href="/catalogo" className="px-10 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-[#e35a39] transition-all duration-300 hover:scale-105 active:scale-95">
            Ir para o Catálogo
          </Link>
        </main>
        <ModernFooter stand={stand} />
      </div>
    )
  }

  const ids = idsParam.split(',').filter(Boolean)

  const supabase = await createClient()
  const { data: cars } = await supabase
    .from('carros')
    .select('*')
    .in('id', ids)
    .eq('stand_id', stand.id)

  if (!cars || cars.length === 0) {
    return (
      <div className="bg-[#f9f9f9] text-[#1b1b1b] min-h-screen flex flex-col font-['Manrope'] antialiased">
        <ModernNavbar stand={stand} />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-24">
          <h1 className="text-3xl font-black text-black mb-6 tracking-tight">Viaturas não encontradas</h1>
          <Link href="/catalogo" className="text-[#e35a39] font-bold hover:underline tracking-wide">Voltar ao Catálogo</Link>
        </main>
        <ModernFooter stand={stand} />
      </div>
    )
  }

  // Ordenar para respeitar a ordem original do array de IDs
  const sortedCars = ids.map(id => cars.find(c => c.id === id)).filter(Boolean)

  const formatPrice = (val: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val)

  return (
    <div className="bg-[#f9f9f9] text-[#1b1b1b] min-h-screen flex flex-col font-['Manrope'] antialiased">
      <ModernNavbar stand={stand} />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-[1280px] mx-auto px-8">
          
          {/* Header Section */}
          <div className="mb-16">
            <Link href="/catalogo" className="inline-flex items-center gap-2 text-[#64748b] hover:text-[#e35a39] transition-colors duration-300 mb-6 group">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span className="text-base font-bold">Voltar ao Catálogo</span>
            </Link>
            <h1 className="text-5xl font-black text-black mb-4 tracking-tight">Comparador de Viaturas</h1>
            <p className="text-lg text-[#64748b] max-w-2xl leading-relaxed">Analise as especificações detalhadas lado a lado para encontrar a viatura que melhor se adapta ao seu estilo de vida.</p>
          </div>

          {/* Comparison Table Container */}
          <div className="bg-white border border-[#f1f5f9] rounded-[2rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e2e2 #f1f1f1' }}>
              <div className="min-w-[1000px]">
                
                {/* Top Row: Car Cards */}
                <div className="flex border-b border-[#f1f5f9]">
                  <div className="p-8 flex items-end w-[240px] shrink-0">
                    <span className="text-xs font-bold text-[#64748b] tracking-[0.1em] uppercase">ESPECIFICAÇÕES</span>
                  </div>
                  
                  {sortedCars.map((car, idx) => (
                    <div key={car.id} className={`flex-1 p-8 border-l border-[#f1f5f9] group ${idx % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'}`}>
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-[#f3f3f3]">
                        <CarImageCarousel imagens={car.imagens} altTitle={`${car.marca} ${car.modelo}`} />
                      </div>
                      <div className="mb-6">
                        <h3 className="text-3xl font-bold text-black leading-tight mb-1 tracking-tight">{car.marca}</h3>
                        <p className="text-base text-[#64748b] mb-4">{car.modelo}</p>
                        <p className={`text-2xl font-black ${car.vendido ? 'text-[#64748b] line-through' : 'text-[#e35a39]'}`}>{formatPrice(car.preco)}</p>
                      </div>
                      <Link href={`/carro/${car.id}`} className="block text-center w-full py-3 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#e35a39] hover:scale-[1.02] transition-all duration-300">
                        Ver Detalhes
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Data Rows */}
                <div className="flex bg-white border-b border-[#f1f5f9]">
                  <div className="p-6 px-8 flex items-center w-[240px] shrink-0"><span className="text-base font-bold text-[#64748b]">Ano</span></div>
                  {sortedCars.map((car, idx) => (
                    <div key={car.id} className={`flex-1 p-6 px-8 border-l border-[#f1f5f9] flex items-center ${idx % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'}`}><span className="text-base font-bold text-black">{car.ano}</span></div>
                  ))}
                </div>

                <div className="flex bg-[#f8fafc] border-b border-[#f1f5f9]">
                  <div className="p-6 px-8 flex items-center w-[240px] shrink-0"><span className="text-base font-bold text-[#64748b]">Quilómetros</span></div>
                  {sortedCars.map((car, idx) => (
                    <div key={car.id} className={`flex-1 p-6 px-8 border-l border-[#f1f5f9] flex items-center ${idx % 2 === 1 ? 'bg-[#eeeeee]' : 'bg-[#f8fafc]'}`}><span className="text-base font-bold text-black">{car.km.toLocaleString('pt-PT')} km</span></div>
                  ))}
                </div>

                <div className="flex bg-white border-b border-[#f1f5f9]">
                  <div className="p-6 px-8 flex items-center w-[240px] shrink-0"><span className="text-base font-bold text-[#64748b]">Combustível</span></div>
                  {sortedCars.map((car, idx) => (
                    <div key={car.id} className={`flex-1 p-6 px-8 border-l border-[#f1f5f9] flex items-center ${idx % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'}`}><span className="text-base font-bold text-black">{car.combustivel}</span></div>
                  ))}
                </div>

                <div className="flex bg-[#f8fafc] border-b border-[#f1f5f9]">
                  <div className="p-6 px-8 flex items-center w-[240px] shrink-0"><span className="text-base font-bold text-[#64748b]">Transmissão</span></div>
                  {sortedCars.map((car, idx) => (
                    <div key={car.id} className={`flex-1 p-6 px-8 border-l border-[#f1f5f9] flex items-center ${idx % 2 === 1 ? 'bg-[#eeeeee]' : 'bg-[#f8fafc]'}`}><span className="text-base font-bold text-black">{car.transmissao}</span></div>
                  ))}
                </div>

                <div className="flex bg-white border-b border-[#f1f5f9]">
                  <div className="p-6 px-8 flex items-center w-[240px] shrink-0"><span className="text-base font-bold text-[#64748b]">Potência (cv)</span></div>
                  {sortedCars.map((car, idx) => (
                    <div key={car.id} className={`flex-1 p-6 px-8 border-l border-[#f1f5f9] flex items-center ${idx % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'}`}><span className="text-base font-bold text-black">{car.potencia_cavalos || 'N/D'}</span></div>
                  ))}
                </div>

                <div className="flex bg-[#f8fafc] border-b border-[#f1f5f9]">
                  <div className="p-6 px-8 flex items-center w-[240px] shrink-0"><span className="text-base font-bold text-[#64748b]">Cilindrada (cc)</span></div>
                  {sortedCars.map((car, idx) => (
                    <div key={car.id} className={`flex-1 p-6 px-8 border-l border-[#f1f5f9] flex items-center ${idx % 2 === 1 ? 'bg-[#eeeeee]' : 'bg-[#f8fafc]'}`}><span className="text-base font-bold text-black">{car.cilindrada || 'N/D'}</span></div>
                  ))}
                </div>

                <div className="flex bg-white border-b border-[#f1f5f9]">
                  <div className="p-6 px-8 flex items-center w-[240px] shrink-0"><span className="text-base font-bold text-[#64748b]">Segmento</span></div>
                  {sortedCars.map((car, idx) => (
                    <div key={car.id} className={`flex-1 p-6 px-8 border-l border-[#f1f5f9] flex items-center ${idx % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'}`}><span className="text-base font-bold text-black">{car.segmento || 'N/D'}</span></div>
                  ))}
                </div>

                <div className="flex bg-[#f8fafc]">
                  <div className="p-6 px-8 flex items-center w-[240px] shrink-0"><span className="text-base font-bold text-[#64748b]">Importado</span></div>
                  {sortedCars.map((car, idx) => (
                    <div key={car.id} className={`flex-1 p-6 px-8 border-l border-[#f1f5f9] flex items-center ${idx % 2 === 1 ? 'bg-[#eeeeee]' : 'bg-[#f8fafc]'}`}><span className="text-base font-bold text-black">{car.importado ? 'Sim' : 'Não'}</span></div>
                  ))}
                </div>
                
              </div>
            </div>
          </div>
          
          {/* Additional Help / CTA Section */}
          <div className="mt-24 bg-[#0c1421] rounded-[3rem] p-16 text-center text-white">
            <h2 className="text-4xl font-black mb-6 tracking-tight">Ainda com dúvidas?</h2>
            <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto leading-relaxed">Os nossos especialistas estão disponíveis para lhe proporcionar um aconselhamento personalizado e test-drives exclusivos.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href={`tel:+351900000000`} className="inline-block px-10 py-4 bg-[#e35a39] text-white rounded-full text-xs font-bold uppercase tracking-[0.1em] hover:scale-105 transition-all shadow-lg shadow-[#e35a39]/20">
                Falar com Especialista
              </a>
              <a href={`mailto:geral@${stand.dominio}?subject=Pedido de Test-Drive`} className="inline-block px-10 py-4 bg-transparent border border-white/20 text-white rounded-full text-xs font-bold uppercase tracking-[0.1em] hover:bg-white/10 transition-all">
                Agendar Test-Drive
              </a>
            </div>
          </div>

        </div>
      </main>

      <ModernFooter stand={stand} />
    </div>
  )
}
