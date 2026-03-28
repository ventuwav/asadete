import { useState } from 'react';
import { User, Receipt, Check, Wallet, History, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import Grill from '../components/Grill';
import BottomNav from '../components/BottomNav';
import { api } from '../lib/api';
import { useCopyLink } from '../hooks/useCopyLink';

interface Props {
  shareToken: string;
  data: any;
  currentUser: any;
  adminToken: string | null;
  onRefresh: () => void;
}

export default function SettledDashboard({ shareToken, data, currentUser, adminToken, onRefresh }: Props) {
  const { copied, copy } = useCopyLink();
  const [showDTPanel, setShowDTPanel] = useState(false);

  const total_pool = data.expenses.reduce((sum: number, e: any) => sum + e.total_amount, 0);
  const relevantDebts = currentUser
    ? data.debts.filter((d: any) => d.from_participant_id === currentUser.id || d.to_participant_id === currentUser.id)
    : data.debts;
  const confirmedDebtsTotal = data.debts.filter((d: any) => d.status === 'confirmed').reduce((sum: number, d: any) => sum + d.amount, 0);
  const totalDebtsAmount = data.debts.reduce((sum: number, d: any) => sum + d.amount, 0);
  const progressPercent = totalDebtsAmount > 0 ? Math.round((confirmedDebtsTotal / totalDebtsAmount) * 100) : 100;

  const payMutation = useMutation({
    mutationFn: (debtId: string) => api.debts.pay(debtId),
    onSuccess: onRefresh,
  });

  const confirmMutation = useMutation({
    mutationFn: (debtId: string) => api.debts.confirm(debtId),
    onSuccess: onRefresh,
  });

  const revertMutation = useMutation({
    mutationFn: () => api.events.revert(shareToken),
    onSuccess: onRefresh,
  });

  return (
    <div className="min-h-screen bg-[#fcf8f7] flex flex-col font-body text-[#1f1a17] pb-32">
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

      <div className="px-6 py-4 max-w-md mx-auto w-full space-y-8 animate-in fade-in">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-[#b83a0a] mb-2">Resumen de Liquidación</p>
          <h1 className="text-4xl font-heading font-extrabold tracking-tight mb-4 leading-[1.1]">Cuentas claras,<br />amistad eterna.</h1>
          <h2 className="text-[44px] font-heading font-bold tracking-tighter flex items-center gap-3">
            <span className="text-2xl mt-1">$</span>{total_pool.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            <span className="text-[11px] font-bold text-[#5a504b] uppercase tracking-widest mt-2">balance total</span>
          </h2>
          <div className="grid grid-cols-2 gap-3 mt-5">
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

        <div className="space-y-8">
          {!currentUser && (
            <div className="bg-[#fff9e6] border border-[#ffeb99] rounded-2xl p-4 flex gap-3 items-start shadow-sm mb-6">
              <span className="text-xl">⚠️</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-[#856404]">No vinculó tu usuario</p>
                <p className="text-[10px] text-[#856404]/80 mt-0.5">Entraste como visitante. ¿Sos alguno de estos invitados? Tocá tu nombre para ver tus deudas:</p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {data.participants.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => { localStorage.setItem(`asadete_${shareToken}`, p.participant_token); window.location.reload(); }}
                      className="bg-white hover:bg-[#fffdf5] text-[10px] font-bold text-[#856404] px-2.5 py-1.5 rounded-lg border border-[#ffeb99] shadow-sm transition-colors active:scale-95"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {adminToken && currentUser?.is_creator && data.debts.length > 0 && (
            <div>
              <button
                onClick={() => setShowDTPanel(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-[1rem] border border-[#e8ded8] bg-white text-[#1f1a17] transition-colors hover:bg-[#f7f2ef]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black tracking-[0.2em] uppercase bg-[#b83a0a] text-white px-2 py-1 rounded-md">DT</span>
                  <span className="text-[12px] font-bold">Panel de transferencias</span>
                </div>
                {showDTPanel ? <ChevronUp size={16} className="text-[#7a706b]" /> : <ChevronDown size={16} className="text-[#7a706b]" />}
              </button>

              {showDTPanel && (
                <div className="bg-[#1f1a17] rounded-[1.5rem] p-5 space-y-4 mt-2">
                  <div className="space-y-2">
                    {data.debts.map((debt: any) => {
                      const isConfirmed = debt.status === 'confirmed';
                      const isPaid = debt.status === 'paid';
                      const creditor = data.participants.find((p: any) => p.id === debt.to_participant_id);
                      return (
                        <div key={debt.id} className={`flex items-center justify-between rounded-xl p-3 gap-3 ${isConfirmed ? 'bg-white/5 opacity-50' : 'bg-white/10'}`}>
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <button
                              onClick={() => !isConfirmed && confirmMutation.mutate(debt.id)}
                              disabled={isConfirmed}
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all flex-shrink-0 ${isConfirmed ? 'bg-[#1c7327] border-[#1c7327] text-white' : 'border-white/20 hover:border-[#b83a0a] bg-white/5 hover:bg-[#b83a0a]/10 text-white/30 hover:text-white'}`}
                            >
                              {isConfirmed && <Check size={12} strokeWidth={4} />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-white font-bold text-[12px] truncate">{debt.from_participant.name}</span>
                                <span className="text-white/40 text-[10px]">→</span>
                                <span className="text-white font-bold text-[12px] truncate">{debt.to_participant.name}</span>
                              </div>
                              {creditor?.alias && <p className="text-white/50 text-[10px] font-medium mt-0.5 truncate">{creditor.alias}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-white font-heading font-extrabold text-[14px]">${debt.amount.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isConfirmed ? 'bg-[#1c7327]/60 text-green-300' : isPaid ? 'bg-yellow-600/40 text-yellow-200' : 'bg-white/10 text-white/50'}`}>
                              {isConfirmed ? '✓ ok' : isPaid ? 'en camino' : 'pendiente'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {relevantDebts.some((d: any) => currentUser?.id === d.from_participant_id && d.status !== 'confirmed') && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-heading font-extrabold">Tenés que pagar</h3>
                <span className="bg-[#f8dfd8] text-[#b83a0a] text-[9px] font-extrabold px-3 py-1 rounded-full tracking-widest uppercase">PENDIENTE</span>
              </div>
              <div className="space-y-4">
                {relevantDebts.map((debt: any) => {
                  if (currentUser?.id !== debt.from_participant_id || debt.status === 'confirmed') return null;
                  const isPaid = debt.status === 'paid';
                  return (
                    <div key={debt.id} className="bg-[#f7f2ef] rounded-2xl p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-[#ffddcd] flex items-center justify-center text-black">
                            <User size={20} fill="currentColor" />
                          </div>
                          <div>
                            <p className="font-heading font-extrabold text-[15px]">{debt.to_participant.name}</p>
                            <p className="text-[11px] text-[#7a706b]">Por los gastos compartidos</p>
                            {debt.to_participant.alias && <p className="text-[10px] text-[#b83a0a] font-mono mt-0.5">{debt.to_participant.alias}</p>}
                          </div>
                        </div>
                        <span className="font-heading font-bold text-xl text-[#b83a0a]">${debt.amount.toLocaleString()}</span>
                      </div>
                      <button disabled={isPaid || payMutation.isPending} onClick={() => payMutation.mutate(debt.id)} className={`w-full py-4 text-white rounded-[0.8rem] text-sm font-bold flex justify-center items-center gap-2 transition-all ${isPaid ? 'bg-[#d9d2ce] text-[#7a706b]' : 'bg-[#b83a0a] hover:bg-[#8a2905]'}`}>
                        <Check size={18} strokeWidth={3} /> {isPaid ? 'Esperando confirmación' : 'Marcar como Pagado'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {relevantDebts.some((d: any) => currentUser?.id === d.to_participant_id && d.status !== 'confirmed') && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-heading font-extrabold">Vas a recibir</h3>
                <span className="bg-[#e8ded8] text-[#5a504b] text-[9px] font-extrabold px-3 py-1 rounded-full tracking-widest uppercase">A FAVOR</span>
              </div>
              <div className="space-y-4">
                {relevantDebts.map((debt: any) => {
                  if (currentUser?.id !== debt.to_participant_id || debt.status === 'confirmed') return null;
                  const isPaid = debt.status === 'paid';
                  return (
                    <div key={debt.id} className="bg-[#f7f2ef] rounded-2xl p-4 space-y-4 relative overflow-hidden">
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isPaid ? 'bg-[#1c7327]' : 'bg-[#d9d2ce]'}`} />
                      <div className="flex justify-between items-center pl-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center ${isPaid ? 'bg-[#96f39e] text-[#1c7327]' : 'bg-[#e8ded8] text-[#5a504b]'}`}>
                            <User size={20} fill="currentColor" />
                          </div>
                          <div>
                            <p className="font-heading font-extrabold text-[15px]">{debt.from_participant.name}</p>
                            <p className="text-[11px] text-[#7a706b]">Por los gastos compartidos</p>
                          </div>
                        </div>
                        <span className={`font-heading font-bold text-xl ${isPaid ? 'text-[#1c7327]' : 'text-[#2b2725]'}`}>${debt.amount.toLocaleString()}</span>
                      </div>
                      <button onClick={() => confirmMutation.mutate(debt.id)} disabled={confirmMutation.isPending} className={`w-full py-4 text-white rounded-[0.8rem] text-sm font-bold flex justify-center items-center gap-2 transition-all ${isPaid ? 'bg-[#135c1d] hover:bg-black' : 'bg-[#b83a0a] hover:bg-[#8a2905]'}`}>
                        <Receipt size={18} strokeWidth={3} />
                        {isPaid ? 'Confirmar Recepción ✓' : 'Recibí el pago'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#e8ded8]/50 rounded-[1.5rem] p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[#5a504b] mb-4">Progreso de cobros</p>
          <div className="h-2.5 bg-[#d9d2ce]/60 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-[#1c7327] rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-[#5a504b]">
            <span className="text-[#1c7327]">{progressPercent}% Recaudado</span>
            <span>Faltan ${(totalDebtsAmount - confirmedDebtsTotal).toLocaleString()}</span>
          </div>
        </div>

        {currentUser?.is_creator && (
          <div className="pt-8 flex justify-center gap-4 pb-8 border-t border-[#e8ded8] mt-8">
            <button onClick={() => revertMutation.mutate()} disabled={revertMutation.isPending} className="w-full py-3.5 text-[12px] font-bold tracking-widest uppercase text-[#b83a0a] hover:text-[#8a2905] transition-colors flex items-center justify-center gap-1.5 border border-[#b83a0a]/30 bg-[#f5e4df]/50 rounded-[1rem] disabled:opacity-50">
              Des-liquidar <History size={16} />
            </button>
            <button onClick={() => revertMutation.mutate()} disabled={revertMutation.isPending} className="w-full py-3.5 text-[12px] font-bold tracking-widest uppercase text-[#5a504b] hover:text-[#b83a0a] transition-colors flex items-center justify-center gap-1.5 border border-transparent bg-[#e8ded8] rounded-[1rem] disabled:opacity-50">
              Archivar Asado <X size={16} />
            </button>
          </div>
        )}
      </div>

      <BottomNav
        activeTab="DEUDAS"
        onGastos={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onDeudas={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onCompartir={() => copy(`${window.location.origin}/e/${shareToken}/join`)}
        copiedLink={copied}
      />
    </div>
  );
}
