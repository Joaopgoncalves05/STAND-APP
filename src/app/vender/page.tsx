import Link from 'next/link';
import { getTenant } from '@/utils/tenant';
import { NotFoundStand } from '@/components/ui/NotFoundStand';
import { ModernNavbar } from '@/components/templates/modern/Navbar';
import { ModernFooter } from '@/components/templates/modern/Footer';
import { VenderCarroWizard } from '@/components/forms/VenderCarroWizard';

export const metadata = {
  title: 'Vender Carro | Luxe Auto',
  description: 'Venda o seu carro com confiança. Simples, rápido e com o valor justo que o seu automóvel merece.',
};

export default async function VenderCarroPage() {
  const stand = await getTenant();

  if (!stand) return <NotFoundStand />;

  return (
    <div className="bg-white text-black antialiased flex flex-col min-h-screen">
      <ModernNavbar stand={stand} />
      <main className="flex-1">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center pt-12 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img alt="Luxury sedan in studio" className="w-full h-full object-cover filter brightness-[0.3]" data-alt="A high-end professional automotive photography shot of a sleek silver luxury sedan parked in a minimalist, brightly lit concrete studio." src="https://lh3.googleusercontent.com/aida/ADBb0ujUM2TROnDs2G6YYV9wKJC1hji1QZClsxEPZKGX3u0SW6kRoZEFTw1tOvkoBg2yS-RTE-ScRPyqHGv3hRNiN1L7AM-LwINRnl-kj51AoxE-A-sqtvX--ew3KywlHBFWGo4I97w_k0Y8FUDcJdD0LFJqulf5ufQFnyaz0bGmyPBZvzgNYCZVfVQv6cH5kioU8MGtuNVGB9PVfnAO7m_ofC9oIcBH21OY5ZApTB4Kfr5dgaZ8-EYiIc4PYkZ0JRmozAiDcC9FxhtNpA"/>
        </div>
        
        <div className="relative z-10 max-w-[1280px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-left text-white">
            <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight leading-tight">
              Venda o seu carro com <span className="text-[#e35a39]">confiança</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-light leading-relaxed max-w-lg">
              Simples, rápido e com o valor justo que o seu automóvel merece.
            </p>
          </div>

          {/* Valuation Form Card */}
          <div id="top" className="scroll-mt-32">
            <VenderCarroWizard cor={stand.cor_primaria || '#e35a39'} />
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="py-24 md:py-32 px-6 bg-slate-50">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] block mb-4">Processo Simples</span>
            <h2 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tight">Como Funciona</h2>
            <div className="w-16 h-px bg-slate-300 mx-auto mt-8"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {/* Step 1 */}
            <div className="bg-white p-10 rounded-3xl border border-slate-100 flex flex-col items-center text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-8 group-hover:bg-black transition-colors duration-500">
                <span className="text-3xl font-black text-slate-300 group-hover:text-white transition-colors duration-500">1</span>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 uppercase tracking-tight">Preencha os dados</h3>
              <p className="text-slate-500 text-lg font-light leading-relaxed">Insira as informações básicas do seu veículo no nosso formulário digital em menos de 2 minutos.</p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white p-10 rounded-3xl border border-slate-100 flex flex-col items-center text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-8 group-hover:bg-black transition-colors duration-500">
                <span className="text-3xl font-black text-slate-300 group-hover:text-white transition-colors duration-500">2</span>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 uppercase tracking-tight">Oferta Justa</h3>
              <p className="text-slate-500 text-lg font-light leading-relaxed">A nossa equipa analisa o mercado em tempo real para lhe apresentar a melhor valorização possível.</p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white p-10 rounded-3xl border border-slate-100 flex flex-col items-center text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-8 group-hover:bg-black transition-colors duration-500">
                <span className="text-3xl font-black text-slate-300 group-hover:text-white transition-colors duration-500">3</span>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 uppercase tracking-tight">Pagamento Imediato</h3>
              <p className="text-slate-500 text-lg font-light leading-relaxed">Após a inspeção final, o valor é transferido para a sua conta no próprio dia. Sem burocracias.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust/Testimonials Section */}
      <section className="bg-black text-white py-24 md:py-32 px-6 relative overflow-hidden">
        {/* Visual Accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-20 hidden lg:block">
          <img alt="Abstract Automotive Details" className="w-full h-full object-cover mask-image-gradient-to-l" src="https://lh3.googleusercontent.com/aida/ADBb0uj8bdPEq2IkR2xfYqLWKro-jy3p5BMYJc21QMgxbwS9KfYhShtAcaZrm5ZUh3PSdeCO9gtXgyvrn2cciJXCpSJkzhenIxyBn9ucSmAq00U_dEZrKXylYhDEYJLWvDy3mfIFopKi0QI-Pr7xKIitaJwwg5Sao3WlH-YZsZZitkZXkZm3m7x-Bg-GyvqbQw-dfzb5yaOQ16qPEbybqtRbwvnt_iEGoBZun_Ty5-WjsRxx3hr0qh5QoJdH0gJiJX2vMRuPh2iAZPTp8aA"/>
        </div>
        
        <div className="max-w-[1280px] mx-auto relative z-10">
          <div className="mb-20 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">Confiança em cada quilómetro</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-12">
              {/* Testimonial 1 */}
              <div className="border-l-4 border-[#e35a39] pl-8">
                <p className="text-xl md:text-2xl text-slate-300 font-light italic mb-8 leading-relaxed">"Vendi o meu Mercedes em menos de 24 horas. O processo foi incrivelmente transparente e o valor foi superior ao que me ofereceram noutros concessionários."</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">R</div>
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Ricardo S., Lisboa</span>
                </div>
              </div>
              
              {/* Testimonial 2 */}
              <div className="border-l-4 border-[#e35a39] pl-8">
                <p className="text-xl md:text-2xl text-slate-300 font-light italic mb-8 leading-relaxed">"A rapidez no pagamento foi o que mais me impressionou. No dia em que entreguei o carro, o dinheiro já estava na conta. Serviço de excelência."</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">A</div>
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Ana M., Porto</span>
                </div>
              </div>
            </div>
            
            {/* Visual Feature */}
            <div className="rounded-3xl overflow-hidden border border-slate-800 h-full min-h-[300px]">
              <img alt="Luxury Car Interior" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" src="https://lh3.googleusercontent.com/aida/ADBb0uhZm0aCQL0Kmfe5zw_EQJpm9e_dTC1T7B41aCv9rBgxAEyv6UdlLYTiicghx8lCNDj2LBowy13NpcOHwqN0rPePJq-sAvDSFIfjdjFON53i8AhPs1-pd5StQjhF-ocC4CAbcYL_hLYgXa4NWVNkSdCXNia-PM1IDpQkM4-6GvaPVBA_WbohxlzybvnI0JtRLFZ9zMKFxo3QckKj0EHbicqIsyWcnXte2gaP1da3lkgvmR34SS9A1zw16eacnSpA2SgoKZ0GWlKkAQ"/>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Area */}
      <section className="py-24 px-6 text-center bg-white">
        <div className="max-w-xl mx-auto">
          <h3 className="text-3xl font-black text-black mb-10 uppercase tracking-tight">Pronto para começar?</h3>
          <Link href="#top" className="bg-black text-white font-bold text-sm uppercase tracking-widest px-12 py-5 rounded-full hover:bg-[#e35a39] transition-all active:scale-95 shadow-xl inline-block">
            AVALIAR O MEU CARRO
          </Link>
          
          <div className="mt-16 flex flex-wrap justify-center gap-6 md:gap-12">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Seguro
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Rápido
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Valor Justo
            </span>
          </div>
        </div>
      </section>
      </main>
      <ModernFooter stand={stand} />
    </div>
  );
}
