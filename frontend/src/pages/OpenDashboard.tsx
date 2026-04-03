import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Check, X, ShoppingBag, Wallet, PanelTopClose, Pencil } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BottomNav from '../components/BottomNav';
import PageLayout from '../components/PageLayout';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import SectionLabel from '../components/SectionLabel';
import { Button } from '../components/ui/button';
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
      await queryClient.cancelQueries({ queryKey: eventQueryKey(shareToken) });
      const previous = queryClient.getQueryData(eventQueryKey(shareToken));
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
      queryClient.setQueryData(eventQueryKey(shareToken), context.previous);
    },
    onSettled: () => {
      onRefresh();
    },
  });

  const settleMutation = useMutation({
    mutationFn: () => api.events.settle(shareToken),
    onSuccess: onRefresh,
  });

  const userAvatar = currentUser?.is_creator && adminToken
    ? <img src="/dt-shield.jpg" alt="DT" className="w-12 h-12 rounded-full object-cover border-2 border-primary shadow-sm" />
    : <div className="w-10 h-10 rounded-full bg-surfaceHighest flex items-center justify-center"><User size={18} fill="currentColor" className="text-onSurfaceVariant" /></div>;

  return (
    <PageLayout>
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

      <AppHeader variant="compact" right={userAvatar} />

      <div className="px-5 mt-2 relative z-10 w-full max-w-md mx-auto flex-1">
        {/* Stats */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-onSurfaceVariant text-xs font-bold mb-1 uppercase tracking-wider">Total asaDeTe</p>
              <h2 className="text-4xl font-heading font-extrabold tracking-tight text-primary">${total_pool.toLocaleString('es-AR')}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 flex flex-col gap-1.5">
              <User className="text-primary" size={18} />
              <span className="text-2xl font-heading font-extrabold text-onSurface">{data.participants.length}</span>
              <SectionLabel>Invitados</SectionLabel>
            </Card>
            <Card className="p-4 flex flex-col gap-1.5">
              <Wallet className="text-success" size={18} />
              <span className="text-2xl font-heading font-extrabold text-onSurface">${total_pool.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
              <SectionLabel>En gastos</SectionLabel>
            </Card>
          </div>
        </div>

        <Card className="flex justify-between items-center p-4 rounded-2xl mb-8">
          <div>
            <SectionLabel className="mb-1">Tu cuota actual</SectionLabel>
            <p className="font-heading font-extrabold text-success text-xl">${myShare.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <SectionLabel>Estado</SectionLabel>
            <div className="bg-surfaceHighest text-onSurfaceVariant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Asignando Gastos</div>
          </div>
        </Card>

        {/* Tab switcher */}
        <div className="flex bg-surfaceHighest p-1 rounded-inner mb-8">
          <button onClick={() => setOpenTab('consumos')} className={`w-1/2 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-[0.8rem] transition-colors ${openTab === 'consumos' ? 'text-onSurface bg-white shadow-sm' : 'text-onSurfaceVariant hover:text-onSurface'}`}>Tu Consumo</button>
          <button onClick={() => setOpenTab('resumen')} className={`w-1/2 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-[0.8rem] transition-colors ${openTab === 'resumen' ? 'text-onSurface bg-white shadow-sm' : 'text-onSurfaceVariant hover:text-onSurface'}`}>Asignación</button>
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
                className="text-[10px] font-bold tracking-widest uppercase text-primary bg-primaryLight/50 px-3 py-1.5 rounded-sm hover:bg-primaryLight transition-colors"
              >
                Editar mis gastos
              </button>
            </div>
            <Card variant="surface" className="p-5 space-y-3">
              <p className="text-xs text-onSurfaceVariant mb-4 font-medium leading-relaxed">Destildá lo que no consumiste tocando el ítem. Tu cuota se va a descontar proporcionalmente y el resto la absorberá.</p>
              {allItems.map((it: any) => {
                const isConsuming = it.consumers.some((c: any) => c.id === currentUser?.id);
                return (
                  <div key={it.id} onClick={() => toggleMutation.mutate(it.id)} className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.98] ${isConsuming ? 'bg-white border-surfaceLow shadow-sm' : 'bg-surfaceHighest/30 border-transparent opacity-70'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${isConsuming ? 'bg-success text-white' : 'bg-outlineVariant text-onSurfaceVariant'}`}>
                        {isConsuming ? <Check size={14} strokeWidth={4} /> : <X size={14} strokeWidth={4} />}
                      </div>
                      <span className={`font-bold text-sm ${isConsuming ? 'text-onSurface' : 'text-onSurfaceVariant line-through decoration-outlineVariant'}`}>{it.name}</span>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${isConsuming ? 'text-success' : 'text-onSurfaceVariant'}`}>${it.amount.toLocaleString('es-AR')}</p>
                      <p className="text-[9px] text-onSurfaceVariant font-bold uppercase tracking-widest mt-0.5">{it.consumers.length} comparten</p>
                    </div>
                  </div>
                );
              })}
            </Card>
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
                  <Card key={p.id} className="p-6 relative">
                    {currentUser?.id === p.id && <div className="absolute top-0 right-0 bg-onSurface text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-bl-xl rounded-tr-card">Vos</div>}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full border border-surfaceLow flex items-center justify-center font-heading font-bold text-lg text-onSurface bg-white">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-heading font-extrabold text-[16px]">{p.name}</p>
                          <p className="text-[12px] font-bold text-primary uppercase tracking-widest">Compras: ${participantPaid.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {adminToken && currentUser?.is_creator && (
                          <button onClick={() => setEditingParticipant(p)} className="w-9 h-9 rounded-full bg-primaryLight flex items-center justify-center text-primary hover:bg-primaryLight/80 transition-colors">
                            <Pencil size={15} strokeWidth={2.5} />
                          </button>
                        )}
                        <div className="text-right">
                          <SectionLabel className="mb-0.5 block">Cuota DT</SectionLabel>
                          <p className="font-heading font-bold text-xl">${participantOwesTotal.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    </div>
                    {itemsConsumed.length > 0 && (
                      <div className="bg-surface border border-outlineVariant rounded-xl p-3 mb-6">
                        <SectionLabel className="mb-2 px-1 block">Detalle de consumos</SectionLabel>
                        <div className="space-y-1.5">
                          {itemsConsumed.map((it: any, idx: number) => {
                            const isFallback = it.consumers.length === 0;
                            const frac = isFallback ? it.amount / (data.participants.length || 1) : it.amount / it.consumers.length;
                            return (
                              <div key={idx} className="flex justify-between items-center text-[11px] font-semibold text-onSurfaceVariant px-1">
                                <span className="flex items-center gap-1.5"><ShoppingBag size={10} className="text-primary/50" /> {it.name} <span className="text-[9px] text-outlineVariant">({isFallback ? 'todos' : `${it.consumers.length} pers`})</span></span>
                                <span>${frac.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {currentUser?.is_creator ? (
              <div className="pt-2 flex flex-col items-center w-full mt-8 border-t border-outlineVariant">
                <div className="w-full pt-8">
                  <Button
                    onClick={() => settleMutation.mutate()}
                    disabled={settleMutation.isPending}
                    className="w-full"
                  >
                    <PanelTopClose size={20} /> {settleMutation.isPending ? 'LIQUIDANDO...' : 'LIQUIDAR ASADETE'}
                  </Button>
                  <p className="text-[9px] text-center text-onSurfaceVariant font-bold mt-4 uppercase tracking-widest">Solo el DT de la fecha puede cerrar la cuenta</p>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-center text-primary bg-surface border border-surfaceLow p-4 rounded-xl font-bold mt-8 uppercase tracking-widest">Esperando que el DT liquide la cuenta...</p>
            )}
          </div>
        )}

        {adminToken && currentUser?.is_creator && (
          <Card variant="dark" className="flex items-center justify-between px-5 py-3.5 mt-6 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-white text-[9px] font-black tracking-[0.2em] uppercase bg-primary px-2 py-1 rounded-md">DT</span>
              <span className="text-white/80 text-[11px] font-bold">Modo Director Técnico</span>
            </div>
            <button onClick={() => setOpenTab('resumen')} className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-white bg-white/15 px-3 py-1.5 rounded-sm hover:bg-white/25 transition-colors">
              <Pencil size={12} /> Editar gastos
            </button>
          </Card>
        )}
      </div>

      <BottomNav
        activeTab="GASTOS"
        onGastos={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onDeudas={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onCompartir={() => copy(`${window.location.origin}/e/${shareToken}/join`)}
        onAyuda={() => navigate(`/e/${shareToken}/ayuda`)}
        copiedLink={copied}
      />
    </PageLayout>
  );
}
