import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Heart, ShoppingBag, Receipt, Plus, ArrowLeft } from 'lucide-react';
import Grill from '../components/Grill';

interface Props {
  data: any;
}

export default function ClosedDashboard({ data }: Props) {
  const [showSummary, setShowSummary] = useState(true);
  const allItems = data.expenses.flatMap((e: any) => e.items);

  return (
    <div className="min-h-screen bg-[#fcf8f7] flex flex-col font-body text-[#1f1a17] mb-8">
      <header className="flex items-center justify-between px-6 pt-[max(1.5rem,env(safe-area-inset-top,1.5rem))] pb-2">
        <div className="flex items-center gap-2">
          <Link to="/" className="w-10 h-10 rounded-full bg-[#f2ece9] flex items-center justify-center">
            <ArrowLeft size={20} />
          </Link>
        </div>
      </header>

      <div className="px-6 py-8 flex-1 flex flex-col items-center max-w-md mx-auto w-full text-center space-y-10 animate-in fade-in">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-white shadow-xl shadow-[#b83a0a]/5 flex items-center justify-center mx-auto mb-8 border border-[#e8ded8] relative z-10">
            <Grill className="text-[#b83a0a]" fill="#b83a0a" size={56} />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#f5e4df]/50 rounded-full blur-3xl -z-10" />
          <h1 className="text-[40px] font-heading font-extrabold tracking-tight leading-10 mb-4 text-[#1f1a17]">¡Un aplauso<br />para el DT!</h1>
          <p className="text-[#5a504b] text-sm font-medium">El ritual ha concluido con éxito.</p>
        </div>

        <div className="w-full bg-[#fcf8f7] border border-[#d9d2ce] rounded-[1.5rem] p-6 flex justify-between items-center text-left">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#7a706b] mb-1">Estado del encuentro</p>
            <h2 className="text-xl font-heading font-bold text-[#1c7327]">Asado Saldado</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#96f39e]/50 flex items-center justify-center text-[#1c7327]">
            <Check size={24} strokeWidth={3} />
          </div>
        </div>

        {showSummary && (
          <div className="w-full bg-white rounded-[1.5rem] p-6 text-left border border-[#e8ded8] shadow-sm animate-in zoom-in-95 fade-in duration-200">
            <h3 className="text-lg font-heading font-extrabold mb-4 text-[#1f1a17]">Balance Final</h3>
            <div className="space-y-4">
              {data.participants.map((p: any) => {
                const participantPaid = data.expenses.filter((e: any) => e.participant_id === p.id).reduce((sum: number, e: any) => sum + e.total_amount, 0);
                const itemsConsumed = allItems.filter((it: any) => it.consumers.length === 0 || it.consumers.some((c: any) => c.id === p.id));
                const participantOwesTotal = itemsConsumed.reduce((sum: number, it: any) => {
                  return sum + (it.consumers.length === 0 ? it.amount / (data.participants.length || 1) : it.amount / it.consumers.length);
                }, 0);

                return (
                  <div key={p.id} className="border-b border-[#f2ece9] pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2 mt-2">
                      <div>
                        <p className="font-heading font-extrabold text-[15px] text-[#2b2725]">{p.name}</p>
                        <p className="text-[10px] font-bold text-[#1c7327] uppercase tracking-wide mt-0.5">En compras: ${participantPaid.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-[#7a706b] uppercase tracking-wide mb-0.5">Cuota DT</p>
                        <p className="font-heading font-bold text-[15px] text-[#b83a0a]">${participantOwesTotal.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                    {itemsConsumed.length > 0 ? (
                      <div className="mt-3 bg-[#fcf8f7] rounded-lg p-2.5 space-y-1.5 border border-[#f2ece9]">
                        {itemsConsumed.map((it: any, idx: number) => {
                          const isFallback = it.consumers.length === 0;
                          const frac = isFallback ? it.amount / (data.participants.length || 1) : it.amount / it.consumers.length;
                          return (
                            <div key={idx} className="flex justify-between items-center text-[11px] text-[#5a504b]">
                              <span className="flex items-center gap-1.5 font-medium"><ShoppingBag size={12} className="text-[#d9d2ce]" /> {it.name}</span>
                              <span className="font-bold">${frac.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#a39a95] italic mt-2">No registró consumos</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="w-full bg-[#efece9] rounded-[1.5rem] p-6 text-left border border-transparent">
          <h3 className="text-lg font-heading font-extrabold flex items-center gap-2 mb-3 text-[#1f1a17]">
            <Heart className="text-[#b83a0a] fill-[#b83a0a]" size={20} /> Mantené vivo el fuego
          </h3>
          <p className="text-xs text-[#5a504b] font-medium leading-relaxed mb-6">Si disfrutaste la app, podés dejar una pequeña colaboración para seguir mejorando las herramientas del asador.</p>
          <div className="grid grid-cols-3 gap-3 mb-2">
            <div className="bg-white rounded-[1.25rem] p-4 text-center shadow-sm border border-[#e8ded8]">
              <p className="text-[10px] text-[#7a706b] mb-1">Chico</p>
              <p className="font-heading font-bold text-[15px]">$500</p>
            </div>
            <div className="bg-white rounded-[1.25rem] p-4 text-center border-2 border-[#b83a0a] shadow-sm flex flex-col items-center justify-center">
              <p className="text-[10px] text-[#b83a0a] font-bold mb-1">Recomendado</p>
              <p className="font-heading font-bold text-[15px]">$1000</p>
            </div>
            <div className="bg-white rounded-[1.25rem] p-4 text-center shadow-sm border border-[#e8ded8]">
              <p className="text-[10px] text-[#7a706b] mb-1">Grande</p>
              <p className="font-heading font-bold text-[15px]">$2000</p>
            </div>
          </div>
        </div>

        <div className="w-full space-y-4 pt-4 pb-12">
          <Link to="/" className="w-full py-5 bg-[#b83a0a] text-white rounded-[1.25rem] text-sm font-heading font-bold flex justify-center items-center gap-2 shadow-[0_8px_30px_rgba(184,58,10,0.3)] hover:bg-[#8a2905]">
            <Plus size={20} className="bg-white text-[#b83a0a] rounded-full p-0.5" /> Nuevo Asado
          </Link>
          <button onClick={() => setShowSummary(!showSummary)} className="w-full py-5 bg-[#fcf8f7] border-2 border-[#e8ded8] text-[#2b2725] rounded-[1.25rem] text-sm font-heading font-bold flex justify-center items-center gap-2 hover:bg-[#efece9] transition-colors">
            <Receipt size={18} /> {showSummary ? 'Ocultar Resumen' : 'Ver Resumen Final'}
          </button>
        </div>
      </div>
    </div>
  );
}
