import { Stand } from '@/utils/tenant';
import { ModernNavbar } from './Navbar';
import { ModernFooter } from './Footer';
import { ModernCarCard, Car } from './CarCard';

interface ModernCatalogProps {
  stand: Stand;
  cars: Car[];
  searchParams: { [key: string]: string | undefined };
}

export function ModernCatalog({ stand, cars, searchParams }: ModernCatalogProps) {
  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen flex flex-col font-['Manrope'] antialiased">
      <ModernNavbar stand={stand} />

      {/* Hero Header Section */}
      <header className="bg-[#f8fafc] pt-32 pb-16 border-b border-stone-100">
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-black mb-4 tracking-tight">O Nosso Catálogo</h1>
              <p className="text-lg text-slate-500 max-w-2xl">Descubra a seleção das melhores viaturas do mercado, criteriosamente selecionadas para garantir a máxima qualidade e performance.</p>
            </div>
            <div className="bg-white border border-stone-200 px-6 py-3 rounded-full shadow-sm">
              <span className="text-xs font-bold text-black uppercase tracking-widest">{cars.length} Viaturas Encontradas</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-8 py-16 w-full flex-1">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Column: Filters (Sidebar) */}
          <aside className="md:w-72 flex-shrink-0">
            <form method="GET" className="bg-white h-fit sticky top-28 w-full rounded-2xl border border-stone-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="font-bold text-black text-xs tracking-[0.2em] uppercase">Filtros</h2>
                 <a href="/catalogo" className="text-xs font-bold text-slate-400 hover:text-primary transition-colors">Limpar</a>
              </div>
              
              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Marca ou Modelo</label>
                  <input type="text" name="q" defaultValue={searchParams.q || ''} placeholder="Pesquisar..." className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-black transition-all text-sm"/>
                </div>

                {/* Transmissão */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Transmissão</label>
                  <select name="transmissao" defaultValue={searchParams.transmissao || ''} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-black transition-all text-sm">
                    <option value="">Todas</option>
                    <option value="Manual">Manual</option>
                    <option value="Automática">Automática</option>
                  </select>
                </div>

                {/* Segmento */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Segmento</label>
                  <select name="segmento" defaultValue={searchParams.segmento || ''} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-black transition-all text-sm">
                    <option value="">Todos</option>
                    <option value="Utilitário">Utilitário</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Carrinha">Carrinha</option>
                    <option value="SUV">SUV</option>
                    <option value="Desportivo">Desportivo</option>
                  </select>
                </div>

                {/* Combustível */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Combustível</label>
                  <select name="combustivel" defaultValue={searchParams.combustivel || ''} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-black transition-all text-sm">
                    <option value="">Todos</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Elétrico">Elétrico</option>
                  </select>
                </div>

                {/* Preço */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Preço (€)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" name="precoMin" defaultValue={searchParams.precoMin || ''} placeholder="Mín" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-black transition-all text-sm"/>
                    <input type="number" name="precoMax" defaultValue={searchParams.precoMax || ''} placeholder="Máx" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-black transition-all text-sm"/>
                  </div>
                </div>

                {/* Ano */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Ano</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" name="anoMin" defaultValue={searchParams.anoMin || ''} placeholder="Desde" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-black transition-all text-sm"/>
                    <input type="number" name="anoMax" defaultValue={searchParams.anoMax || ''} placeholder="Até" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-black transition-all text-sm"/>
                  </div>
                </div>

                {/* Quilómetros */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Quilómetros</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" name="kmMin" defaultValue={searchParams.kmMin || ''} placeholder="Mín" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-black transition-all text-sm"/>
                    <input type="number" name="kmMax" defaultValue={searchParams.kmMax || ''} placeholder="Máx" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-black transition-all text-sm"/>
                  </div>
                </div>

                {/* Ordenação */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Ordenar Por</label>
                  <select name="ordem" defaultValue={searchParams.ordem || ''} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-black transition-all text-sm">
                    <option value="">Recentes</option>
                    <option value="preco_asc">Preço: Menor para Maior</option>
                    <option value="preco_desc">Preço: Maior para Menor</option>
                    <option value="km_asc">Quilómetros: Menor para Maior</option>
                    <option value="ano_desc">Ano: Mais Recentes</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-stone-100 mt-6">
                  <button type="submit" className="w-full bg-primary text-white py-4 rounded-lg font-bold text-sm tracking-tight hover:opacity-90 transition-opacity">
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            </form>
          </aside>

          {/* Right Column: Car Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.length > 0 ? (
                cars.map(car => <ModernCarCard key={car.id} car={car} />)
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100">
                  <div className="w-16 h-16 bg-stone-50 text-slate-400 rounded-full mx-auto flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2">Nenhum resultado</h3>
                  <p className="text-slate-500">Tente ajustar os filtros de pesquisa para encontrar o que procura.</p>
                  <a href="/catalogo" className="inline-block mt-4 text-primary font-bold hover:underline">Limpar Filtros</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ModernFooter stand={stand} />
    </div>
  );
}
