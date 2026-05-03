import { getTenant } from '@/utils/tenant';
import { NotFoundStand } from '@/components/ui/NotFoundStand';
import { ModernNavbar } from '@/components/templates/modern/Navbar';
import { ModernFooter } from '@/components/templates/modern/Footer';
import { ContactForm } from '@/components/forms/ContactForm';

export const metadata = {
  title: 'Contactos | Luxe Auto',
  description: 'O nosso serviço de concierge está à sua disposição. Entre em contacto connosco.',
};

export default async function ContactosPage() {
  const stand = await getTenant();

  if (!stand) return <NotFoundStand />;

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <ModernNavbar stand={stand} />
      <main className="flex-1">
      {/* Header Section */}
      <section className="px-6 py-12 md:py-24 max-w-xl mx-auto w-full text-center">
        <h1 className="text-4xl md:text-5xl font-black text-black mb-4 uppercase tracking-tight">Contacte-nos</h1>
        <p className="text-lg md:text-xl text-slate-500 font-light">O nosso serviço de concierge está à sua disposição.</p>
        <div className="w-12 h-1 bg-[#e35a39] mx-auto rounded-full mt-8"></div>
      </section>

      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 pb-20">
        
        {/* Contact Details Column */}
        <section className="w-full order-2 lg:order-1">
          <div className="space-y-10">
            {/* ... rest of contact details ... */}
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full shrink-0">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase mb-1 tracking-widest">Telefone</p>
                <p className="text-2xl font-black text-black">+351 210 000 000</p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full shrink-0">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase mb-1 tracking-widest">Email</p>
                <p className="text-xl md:text-2xl font-black text-black break-all">concierge@{stand.dominio || 'luxeauto.pt'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full shrink-0">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase mb-1 tracking-widest">WhatsApp</p>
                <p className="text-2xl font-black text-black">+351 910 000 000</p>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-100">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full shrink-0">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase mb-2 tracking-widest">Showroom</p>
                  <p className="text-lg text-black font-light leading-relaxed">
                    Avenida da Liberdade, 120<br/>
                    1250-146 Lisboa, Portugal
                  </p>
                </div>
              </div>
              <div className="ml-18 pl-[72px]">
                <p className="text-sm font-bold text-slate-500 uppercase mb-4 tracking-widest">Horário</p>
                <div className="grid grid-cols-[auto_1fr] gap-y-3 gap-x-8 text-lg">
                  <span className="text-slate-500 font-light">Segunda - Sexta</span>
                  <span className="text-black font-bold">09:00 — 20:00</span>
                  <span className="text-slate-500 font-light">Sábado</span>
                  <span className="text-black font-bold">10:00 — 18:00</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Column */}
        <section className="w-full bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-100 order-1 lg:order-2">
          <h3 className="text-2xl font-black text-black mb-8 uppercase tracking-tight">Envie uma mensagem</h3>
          <ContactForm />
        </section>
      </div>

      {/* Map Section */}
      <section className="w-full h-[500px] bg-slate-100 relative overflow-hidden">
        <img className="w-full h-full object-cover grayscale opacity-80" data-alt="Lisbon Map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_PN8kBX3aw-GvW66_Kxn8avF2PysjkkmWo5F0UdoBDc-1pIyC9A_Py9pNs9IfDsg2otqWlHbDToIyfJFUVvIn5zBYYKgfW7JFqX3WEY7VdqAen1n10jh4RcHNXtXm-qLpmAl9xLmLwMR-oYNRmvQL154uYz0evz7VWb_S_IpPF9a3dfiUjW7EU59BweOBR9xlVkcIUwC_PG5I9zrExGyZFHCKxnep2lsQTc1BlXO0qkQU7DA56OyXoeZvbLsZI_fS6pAWPTxnDjAe"/>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-2xl relative">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
            <div className="absolute -inset-4 border-2 border-black/20 rounded-full animate-ping"></div>
          </div>
        </div>
      </section>
      </main>
      <ModernFooter stand={stand} />
    </div>
  );
}
