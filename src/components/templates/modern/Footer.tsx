import Link from 'next/link';
import { Stand } from '@/utils/tenant';
import { NewsletterForm } from '@/components/ui/NewsletterForm';

interface ModernFooterProps {
  stand: Stand;
}

export function ModernFooter({ stand }: ModernFooterProps) {
  return (
    <footer className="w-full py-20 bg-slate-950 border-t border-slate-900 mt-auto">
      <div className="max-w-[1280px] mx-auto px-8">
        {/* Newsletter Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-20 border-b border-slate-800 mb-20">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Stay ahead of the curve.</h2>
            <p className="text-slate-400">Junte-se à nossa lista exclusiva para acesso prioritário a novas chegadas e campanhas.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <NewsletterForm standId={stand.id} />
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div>
            <div className="text-xl font-black tracking-tighter text-white uppercase mb-8">{stand.nome}</div>
            <p className="font-light text-sm tracking-wide text-slate-400 leading-relaxed">
              O seu parceiro de confiança para encontrar o carro perfeito. Qualidade, transparência e as melhores condições de mercado.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase mb-6 tracking-widest">Empresa</h4>
            <ul className="space-y-4">
              <li><Link className="text-sm font-light tracking-wide text-slate-400 hover:text-white hover:translate-x-1 transition-all inline-block" href="/">Início</Link></li>
              <li><Link className="text-sm font-light tracking-wide text-slate-400 hover:text-white hover:translate-x-1 transition-all inline-block" href="/catalogo">Catálogo</Link></li>
              <li><Link className="text-sm font-light tracking-wide text-slate-400 hover:text-white hover:translate-x-1 transition-all inline-block" href="/financiamento">Financiamento</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase mb-6 tracking-widest">Apoio ao Cliente</h4>
            <ul className="space-y-4">
              <li><Link className="text-sm font-light tracking-wide text-slate-400 hover:text-white hover:translate-x-1 transition-all inline-block" href="/contactos">Contactos</Link></li>
              <li className="text-sm font-light tracking-wide text-slate-400">+351 912 345 678</li>
              <li className="text-sm font-light tracking-wide text-slate-400">geral@{stand.dominio}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase mb-6 tracking-widest">Legal</h4>
            <ul className="space-y-4">
              <li><Link className="text-sm font-light tracking-wide text-slate-400 hover:text-white hover:translate-x-1 transition-all inline-block" href="/privacidade">Privacidade</Link></li>
              <li><Link className="text-sm font-light tracking-wide text-slate-400 hover:text-white hover:translate-x-1 transition-all inline-block" href="/termos">Termos de Uso</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright Area */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-900">
          <p className="text-xs font-light tracking-wide text-slate-500">
            &copy; {new Date().getFullYear()} {stand.nome}. Effortless Luxury.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            {/* Social Icons Placeholder */}
          </div>
        </div>
      </div>
    </footer>
  );
}
