import { createClient } from '@/utils/supabase/server'
import { getTenant } from '@/utils/tenant'
import { notFound } from 'next/navigation'
import { PrintButton } from '@/components/ui/PrintButton'

export default async function CartazPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const stand = await getTenant()

  const { data: carro } = await supabase
    .from('carros')
    .select('*')
    .eq('id', id)
    .single()

  if (!carro || !stand) {
    notFound()
  }

  // URL para o QR Code (Aponta para a página de detalhes do site público)
  // Assumindo HTTPS em produção, HTTP local
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const carUrl = `${protocol}://${stand.dominio}/viatura/${carro.id}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(carUrl)}`

  return (
    <div className="bg-white text-black min-h-screen font-sans print:m-0 print:p-0">
      {/* Botão de impressão (Oculto na impressão) */}
      <div className="p-4 bg-slate-100 flex justify-end print:hidden border-b border-slate-200">
        <PrintButton />
      </div>

      {/* Cartaz A4 */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white print:w-full print:h-full print:max-w-none shadow-2xl print:shadow-none p-12 flex flex-col justify-between">
        
        {/* Cabeçalho Stand */}
        <header className="flex justify-between items-center border-b-4 pb-8 mb-8" style={{ borderColor: stand.cor_primaria }}>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter" style={{ color: stand.cor_primaria }}>{stand.nome}</h1>
            <p className="text-slate-500 font-bold tracking-widest mt-1 text-sm uppercase">Revendedor Autorizado</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-800">geral@{stand.dominio}</p>
            <p className="text-slate-500 text-sm">Garantia e Qualidade</p>
          </div>
        </header>

        {/* Informação Principal */}
        <div className="flex-1 flex flex-col">
          <div className="mb-6 flex gap-8 items-end">
            <h2 className="text-7xl font-black uppercase tracking-tight leading-none">
              {carro.marca} <br />
              <span className="text-5xl text-slate-400 font-light">{carro.modelo}</span>
            </h2>
          </div>

          {/* Imagem Principal */}
          {carro.imagens && carro.imagens.length > 0 && (
            <div className="w-full h-[400px] bg-slate-100 rounded-3xl overflow-hidden mb-12 border border-slate-200">
              <img src={carro.imagens[0]} alt={`${carro.marca} ${carro.modelo}`} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Grid de Especificações */}
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ano</p>
              <p className="text-3xl font-black">{carro.ano}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Quilómetros</p>
              <p className="text-3xl font-black">{carro.km.toLocaleString()} <span className="text-xl text-slate-400 font-normal">km</span></p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Combustível</p>
              <p className="text-3xl font-black">{carro.combustivel}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Transmissão</p>
              <p className="text-3xl font-black">{carro.transmissao}</p>
            </div>
          </div>

          {/* Destaques (Se houver descrição curta) */}
          <div className="mb-auto">
            <p className="text-slate-600 leading-relaxed text-lg line-clamp-4">
              {carro.descricao || "Viatura em excelente estado de conservação, com histórico completo de manutenções. Aproveite esta oportunidade única."}
            </p>
          </div>
        </div>

        {/* Rodapé do Cartaz - Preço e QR */}
        <div className="mt-12 flex justify-between items-end bg-slate-900 text-white p-10 rounded-3xl">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Preço Final</p>
            <p className="text-7xl font-black tracking-tighter">
              {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(carro.preco)}
            </p>
          </div>
          <div className="flex flex-col items-center bg-white p-4 rounded-2xl">
            <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
            <p className="text-black text-[10px] font-bold uppercase tracking-widest mt-2 text-center">Ver Mais Fotos</p>
          </div>
        </div>
      </div>
    </div>
  )
}
