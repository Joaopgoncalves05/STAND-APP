import Link from 'next/link';
import { getTenant } from '@/utils/tenant';
import { NotFoundStand } from '@/components/ui/NotFoundStand';
import { ModernNavbar } from '@/components/templates/modern/Navbar';
import { ModernFooter } from '@/components/templates/modern/Footer';

export const metadata = {
  title: 'Sobre Nós | Luxe Auto',
  description: 'Conheça a história e missão do nosso stand. A sua jornada de excelência automóvel começa aqui.',
};

export default async function SobrePage() {
  const stand = await getTenant();

  if (!stand) return <NotFoundStand />;

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <ModernNavbar stand={stand} />
      <main className="flex-1">
      {/* Hero Section */}
      <header className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img alt="Luxury Showroom" className="w-full h-full object-cover filter brightness-[0.4]" data-alt="A sprawling, high-end automotive showroom" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOtbqyI_dyRt_w0kQzY8pbEv65bQJ8iNjTS-RgogZIJ3oV0Cx6KeyESFQgm9nCN-IXF4zoqGgVLexSU0IHwjGXXE6ty6MnKThJZ8Ul1rJDn1kRH2y-eQCuYok0u84iutUQV6Om1B3Bv0CYXbbqzwPj-pspegIMjiPR67UqN5TXcUrYnH23f81aR0XnH6AWhzd8_g19CW_p-SWL19L2fzkK54o8zDhb0_JIip-N61CyPgPruYH19S4GF7IfRdA6jASrE5iHCCxoTYLI"/>
        </div>
        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-8 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">
            Elevating the <br className="hidden md:block"/>
            <span className="text-white">Automotive Experience</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            We are redefining the luxury car buying journey through unparalleled transparency, curated selection, and a commitment to precision that mirrors the machines we represent.
          </p>
          <div className="w-12 h-1 bg-[#e35a39] mx-auto rounded-full"></div>
        </div>
      </header>

      {/* Our Story Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-16 items-center">
            {/* Content (60) */}
            <div className="order-2 md:order-1">
              <span className="text-sm font-bold text-slate-500 mb-4 block uppercase tracking-widest">Our Heritage</span>
              <h2 className="text-4xl font-black mb-8 uppercase tracking-tight">A Legacy of <span className="text-[#e35a39]">Precision</span></h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed font-light">
                <p>
                  Founded in the pursuit of automotive excellence, {stand.nome} emerged from a simple observation: the acquisition of a luxury vehicle should be as refined as the drive itself. For over two decades, we have served as the bridge between world-class engineering and the discerning collector.
                </p>
                <p>
                  Our history is written in the logs of iconic marques and the satisfaction of a global clientele. We don't just sell cars; we curate a collection of mechanical masterpieces, ensuring each vehicle meets a standard of quality that is often whispered about but rarely achieved.
                </p>
              </div>
            </div>
            {/* Image (40) */}
            <div className="order-1 md:order-2">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <img alt="Heritage Detail" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOgT6pgwbG8xQ6RDDMtFLZ2HsH5Gow8lOiFJC3jg-DJY9up7N2XPgsmzUJGYLm4bdTBoBnn_oH-xc8kOvkvktjnzZngiUcu2xEA8xDkHPeAGyxULruo9FdlsNU8GfEHn4iIMhF29kQ8JUqnFdr2SNvvgkBIjeKL1p5grzvV1SUDQRrALnkrfZqhDmiSXgpR-5IkxUzE8wr0fNUvFwFLEgs_opsc81FO7fzHgIqZFS1XqhSeaZS3bL4JLeGHysgghDb9vxos8qrbwNs"/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 md:py-32 bg-slate-50">
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black uppercase mb-4 tracking-tight">The Luxe Standard</h2>
            <div className="w-16 h-px bg-slate-300 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-10 rounded-3xl border border-slate-100 flex flex-col items-center text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-full mb-8 group-hover:bg-black transition-colors duration-300">
                <svg className="w-8 h-8 text-black group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">Transparency</h3>
              <p className="text-slate-600 text-lg font-light leading-relaxed">
                Every vehicle comes with a comprehensive history report and a detailed multi-point inspection, ensuring absolute peace of mind.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-white p-10 rounded-3xl border border-slate-100 flex flex-col items-center text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-full mb-8 group-hover:bg-black transition-colors duration-300">
                <svg className="w-8 h-8 text-black group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">Quality Selection</h3>
              <p className="text-slate-600 text-lg font-light leading-relaxed">
                We hand-select only the finest examples of luxury and performance, maintaining an inventory that defines automotive excellence.
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-white p-10 rounded-3xl border border-slate-100 flex flex-col items-center text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-full mb-8 group-hover:bg-black transition-colors duration-300">
                <svg className="w-8 h-8 text-black group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">Concierge Service</h3>
              <p className="text-slate-600 text-lg font-light leading-relaxed">
                From bespoke financing to door-to-door delivery, our dedicated specialists manage every detail of your acquisition journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dark CTA Section */}
      <section className="bg-black text-white py-24 md:py-32">
        <div className="max-w-[1280px] mx-auto px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-10 uppercase tracking-tight">Your Journey <span className="text-slate-400">Starts Here</span></h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/catalogo" className="w-full sm:w-auto px-10 py-5 bg-white text-black text-sm font-bold uppercase tracking-widest rounded-full hover:bg-[#e35a39] hover:text-white transition-all duration-300 transform active:scale-95 text-center">
              Ver Inventário
            </Link>
            <Link href="/contactos" className="w-full sm:w-auto px-10 py-5 border border-white text-white text-sm font-bold uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-all duration-300 transform active:scale-95 text-center">
              Falar com Consultor
            </Link>
          </div>
          <div className="mt-20">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">{stand.nome} GROUP</p>
          </div>
        </div>
      </section>
      </main>
      <ModernFooter stand={stand} />
    </div>
  );
}
