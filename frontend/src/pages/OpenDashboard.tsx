import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Check, X, ShoppingBag, Wallet, PanelTopClose, Pencil } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Grill from '../components/Grill';
import BottomNav from '../components/BottomNav';
import EditParticipantModal from './EditParticipantModal';
import { api } from '../lib/api';
import { useCopyLink } from '../hooks/useCopyLink';
import { eventQueryKey } from './Dashboard';

interface Props {
  shareToken: string;
  data: any;
  currentUser: any;
  adminToken: string | null;
  onRefresh: () => void;
}

export default function OpenDashboard({ shareToken, data, currentUser, adminToken, onRefresh }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { copied, copy } = useCopyLink();
  const [openTab, setOpenTab] = useState<'consumos' | 'resumen'>('consumos');
  const [navView, setNavView] = useState<'GASTOS' | 'DEUDAS'>('GASTOS');
  const [editingParticipant, setEditingParticipant] = useState<any>(null);

  const allItems = data.expenses.flatMap((e: any) => e.items);
  const total_pool = data.expenses.reduce((sum: number, e: any) => sum + e.total_amount, 0);

  const myShare = allItems.reduce((sum: number, it: any) => {
    if (it.consumers.length > 0) {
      return sum + (it.consumers.some((c: any) => c.id === currentUser?.id) ? it.amount / it.consumers.length : 0);
    }
    return sum + it.amount / (data.participants.length || 1);
  }, 0);

  const toggleMutation = useMutation({
    mutationFn: (itemId: string) => api.items.toggle(itemId, currentUser.id),
    onMutate: async (itemId: string) => {
      // Cancel in-flight refetches so they don't overwrite the optimistic update
      await queryClient.cancelQueries({ queryKey: eventQueryKey(shareToken) });
      const previous = queryClient.getQueryData(eventQueryKey(shareToken));
      // Optimistic update
      queryClient.setQueryData(eventQueryKey(shareToken), (old: any) => ({
        ...old,
        expenses: old.expenses.map((e: any) => ({
          ...e,
          items: e.items.map((it: any) => {
            if (it.id !== itemId) return it;
            const alreadyIn = it.consumers.some((c: any) => c.id === currentUser.id);
            return {
              ...it,
              consumers: alreadyIn
                ? it.consumers.filter((c: any) => c.id !== currentUser.id)
                : [...it.consumers, { id: currentUser.id }],
            };
          }),
        })),
      }));
      return { previous };
    },
    onError: (_err, _itemId, context: any) => {
      // Roll back on error
      queryClient.setQueryData(eventQueryKey(shareToken), context.previous);
    },
    onSettled: () => {
      // Always reconcile with server truth after toggle
      onRefresh();
    },
  });

  const settleMutation = useMutation({
    mutationFn: () => api.events.settle(shareToken),
    onSuccess: onRefresh,
  });

  return (
    <div className="min-h-screen bg-[#fcf8f7] flex flex-col font-body text-[#1f1a17] pb-32">
      {editingParticipant && adminToken && (
        <EditParticipantModal
          shareToken={shareToken}
          adminToken={adminToken}
          participant={editingParticipant}
          initialExpenses={data.expenses.filter((e: any) => e.participant_id === editingParticipant.id)}
          onClose={() => setEditingParticipant(null)}
          onSaved={async () => { setEditingParticipant(null); await onRefresh(); }}
        />
      )}

      <header className="flex items-center justify-between px-6 pt-[max(1.5rem,env(safe-area-inset-top,1.5rem))] pb-2">
        <div className="flex items-center gap-2">
          <Grill className="text-[#b83a0a]" fill="#b83a0a" size={24} />
          <span className="font-heading font-bold text-lg tracking-tight text-[#b83a0a] italic">Asadete</span>
        </div>
        {currentUser?.is_creator && adminToken ? (
          <img src="/dt-shield.jpg" alt="DT" className="w-12 h-12 rounded-full object-cover border-2 border-[#b83a0a] shadow-sm" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#e8ded8] flex items-center justify-center">
            <User size={18} fill="currentColor" className="text-[#7a706b]" />
          </div>
        )}
      </header>

      <div className="px-5 mt-2 relative z-10 w-full max-w-md mx-auto flex-1">
        <div className="mb-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[#7a706b] text-xs font-bold mb-1 uppercase tracking-wider">Total Asadete</p>
              <h2 className="text-4xl font-heading font-extrabold tracking-tight text-[#b83a0a]">${total_pool.toLocaleString('es-AR')}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-[1.25rem] p-4 flex flex-col gap-1.5 shadow-sm border border-[#e8ded8]/50">
              <User className="text-[#b83a0a]" size={18} />
              <span className="text-2xl font-heading font-extrabold text-[#1f1a17]">{data.participants.length}</span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-[#7a706b]">Invitados</span>
            </div>
            <div className="bg-white rounded-[1.25rem] p-4 flex flex-col gap-1.5 shadow-sm border border-[#e8ded8]/50">
              <Wallet className="text-[#1c7327]" size={18} />
              <span className="text-2xl font-heading font-extrabold text-[#1f1a17]">${total_pool.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-[#7a706b]">En gastos</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-[#e8ded8] mb-8">
          <div>
            <p className="text-[#7a706b] text-[10px] font-bold mb-1 uppercase tracking-wider">Tu cuota actual</p>
            <p className="font-heading font-extrabold text-[#1c7327] text-xl">${myShare.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="text-right">
            <p className="text-[#7a706b] text-[10px] font-bold mb-1 uppercase tracking-wider">Estado</p>
            <div className="bg-[#e8ede9] text-[#5a706b] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block">Asignando Gastos</div>
          </div>
        </div>

        <div className="flex bg-[#e8ded8] p-1 rounded-[1rem] mb-8">
          <button onClick={() => setOpenTab('consumos')} className={`w-1/2 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-[0.8rem] transition-colors ${openTab === 'consumos' ? 'text-[#2b2725] bg-white shadow-sm' : 'text-[#7a706b] hover:text-[#2b2725]'}`}>Tu Consumo</button>
          <button onClick={() => setOpenTab('resumen')} className={`w-1/2 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-[0.8rem] transition-colors ${openTab === 'resumen' ? 'text-[#2b2725] bg-white shadow-sm' : 'text-[#7a706b] hover:text-[#2b2725]'}`}>Asignación</button>
        </div>

        {openTab === 'consumos' && allItems.length > 0 && (
          <div className="mb-8 animate-in slide-in-from-left-4 fade-in duration-300">
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="text-xl font-heading font-extrabold leading-6">Personalizá<br />tu cuota</h3>
              <button
                onClick={() => {
                  const myExp = data.expenses.filter((e: any) => e.participant_id === currentUser?.id);
                  const myItems = myExp.flatMap((e: any) => e.items).map((it: any) => ({ name: it.name, amount: it.amount.toString() }));
                  navigate(`/e/${shareToken}/join?edit=true`, { state: { name: currentUser?.name, alias: currentUser?.alias, items: myItems } });
                }}
                className="text-[10px] font-bold tracking-widest uppercase text-[#b83a0a] bg-[#b83a0a]/10 px-3 py-1.5 rounded-[0.5rem] hover:bg-[#b83a0a]/20 transition-colors"
              >
                Editar mis gastos
              </button>
            </div>
            <div className="bg-[#fcf8f7] border border-[#e8ded8] rounded-[1.5rem] p-5 space-y-3 shadow-sm">
              <p className="text-xs text-[#7a706b] mb-4 font-medium leading-relaxed">Destildá lo que no consumiste tocando el ítem. Tu cuota se va a descontar proporcionalmente y el resto la absorberá.</p>
              {allItems.map((it: any) => {
                const isConsuming = it.consumers.some((c: any) => c.id === currentUser?.id);
                return (
                  <div key={it.id} onClick={() => toggleMutation.mutate(it.id)} className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.98] ${isConsuming ? 'bg-white border-[#f2ece9] shadow-sm' : 'bg-[#e8ded8]/30 border-transparent opacity-70'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${isConsuming ? 'bg-[#1c7327] text-white' : 'bg-[#d9d2ce] text-[#7a706b]'}`}>
                        {isConsuming ? <Check size={14} strokeWidth={4} /> : <X size={14} strokeWidth={4} />}
                      </div>
                      <span className={`font-bold text-sm ${isConsuming ? 'text-[#2b2725]' : 'text-[#7a706b] line-through decoration-[#a39a95]'}`}>{it.name}</span>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${isConsuming ? 'text-[#1c7327]' : 'text-[#7a706b]'}`}>${it.amount.toLocaleString('es-AR')}</p>
                      <p className="text-[9px] text-[#7a706b] font-bold uppercase tracking-widest mt-0.5">{it.consumers.length} comparten</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {openTab === 'resumen' && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="flex justify-between items-center mb-6 px-1">
              <h3 className="text-xl font-heading font-extrabold leading-6">Resumen de<br />asignación</h3>
            </div>
            <div className="space-y-4">
              {data.participants.map((p: any) => {
                const participantPaid = data.expenses.filter((e: any) => e.participant_id === p.id).reduce((sum: number, e: any) => sum + e.total_amount, 0);
                const itemsConsumed = allItems.filter((it: any) => it.consumers.length === 0 || it.consumers.some((c: any) => c.id === p.id));
                const participantOwesTotal = itemsConsumed.reduce((sum: number, it: any) => {
                  return sum + (it.consumers.length === 0 ? it.amount / (data.participants.length || 1) : it.amount / it.consumers.length);
                }, 0);

                return (
                  <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#e8ded8] relative">
                    {currentUser?.id === p.id && <div className="absolute top-0 right-0 bg-black text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-bl-xl rounded-tr-2xl">Vos</div>}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full border border-[#f2ece9] flex items-center justify-center font-heading font-bold text-lg text-black bg-white">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-heading font-extrabold text-[16px]">{p.name}</p>
                          <p className="text-[12px] font-bold text-[#b83a0a] uppercase tracking-widest">Compras: ${participantPaid.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {adminToken && currentUser?.is_creator && (
                          <button onClick={() => setEditingParticipant(p)} className="w-9 h-9 rounded-full bg-[#b83a0a]/10 flex items-center justify-center text-[#b83a0a] hover:bg-[#b83a0a]/20 transition-colors">
                            <Pencil size={15} strokeWidth={2.5} />
                          </button>
                        )}
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-[#7a706b] uppercase tracking-widest mb-0.5">Cuota DT</p>
                          <p className="font-heading font-bold text-xl">${participantOwesTotal.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    </div>
                    {itemsConsumed.length > 0 && (
                      <div className="bg-[#fcf8f7] border border-[#e8ded8] rounded-xl p-3 mb-6">
                        <p className="text-[9px] text-[#7a706b] uppercase font-bold tracking-widest mb-2 px-1">Detalle de consumos</p>
                        <div className="space-y-1.5">
                          {itemsConsumed.map((it: any, idx: number) => {
                            const isFallback = it.consumers.length === 0;
                            const frac = isFallback ? it.amount / (data.participants.length || 1) : it.amount / it.consumers.length;
                            return (
                              <div key={idx} className="flex justify-between items-center text-[11px] font-semibold text-[#5a504b] px-1">
                                <span className="flex items-center gap-1.5"><ShoppingBag size={10} className="text-[#b83a0a]/50" /> {it.name} <span className="text-[9px] text-[#a39a95]">({isFallback ? 'todos' : `${it.consumers.length} pers`})</span></span>
                                <span>${frac.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {currentUser?.is_creator ? (
              <div className="pt-2 flex flex-col items-center w-full mt-8 border-t border-[#e8ded8]">
                <div className="w-full pt-8">
                  <button onClick={() => settleMutation.mutate()} disabled={settleMutation.isPending} className="w-full py-5 bg-[#b83a0a] text-white rounded-[1.25rem] text-[15px] font-heading font-bold transition-transform active:scale-[0.98] shadow-[0_8px_30px_rgba(184,58,10,0.3)] flex justify-center items-center gap-2 hover:bg-[#8a2905] disabled:opacity-70">
                    <PanelTopClose size={20} /> {settleMutation.isPending ? 'LIQUIDANDO...' : 'LIQUIDAR ASADETE'}
                  </button>
                  <p className="text-[9px] text-center text-[#7a706b] font-bold mt-4 uppercase tracking-widest">Solo el DT de la fecha puede cerrar la cuenta</p>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-center text-[#b83a0a] bg-[#fcf8f7] border border-[#f2ece9] p-4 rounded-xl font-bold mt-8 uppercase tracking-widest">Esperando que el DT liquide la cuenta...</p>
            )}
          </div>
        )}

        {adminToken && currentUser?.is_creator && (
          <div className="flex items-center justify-between bg-[#1f1a17] rounded-[1.25rem] px-5 py-3.5 mt-6 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-white text-[9px] font-black tracking-[0.2em] uppercase bg-[#b83a0a] px-2 py-1 rounded-md">DT</span>
              <span className="text-white/80 text-[11px] font-bold">Modo Director Técnico</span>
            </div>
            <button onClick={() => setOpenTab('resumen')} className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-white bg-white/15 px-3 py-1.5 rounded-[0.5rem] hover:bg-white/25 transition-colors">
              <Pencil size={12} /> Editar gastos
            </button>
          </div>
        )}
      </div>

      <BottomNav
        activeTab={navView === 'DEUDAS' ? 'DEUDAS' : 'GASTOS'}
        onGastos={() => { setNavView('GASTOS'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onDeudas={() => { setNavView('DEUDAS'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onCompartir={() => copy(`${window.location.origin}/e/${shareToken}/join`)}
        onAyuda={() => navigate(`/e/${shareToken}/ayuda`)}
        copiedLink={copied}
      />
    </div>
  );
}
