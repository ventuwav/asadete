import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, Receipt, Plus, Check, X, ArrowLeft, Heart, ShoppingBag, Share2, PanelTopClose, Wallet, History, Pencil } from 'lucide-react';
import EditParticipantModal from './EditParticipantModal';

const Grill = ({ size = 24, className = "", strokeWidth = 2, fill = "none" }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 5v2" /><path d="M12 3v4" /><path d="M16 5v2" />
    <path d="M4 11h16a8 8 0 0 1-16 0Z" />
    <line x1="2" y1="11" x2="22" y2="11" />
    <line x1="7" y1="18.5" x2="5" y2="22" />
    <line x1="17" y1="18.5" x2="19" y2="22" />
  </svg>
);

export default function Dashboard() {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedNav, setCopiedNav] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [openTab, setOpenTab] = useState<'consumos' | 'resumen'>('consumos');
  
  const participantToken = localStorage.getItem(`asadete_${shareToken}`);
  const [adminToken, setAdminToken] = useState<string | null>(
    localStorage.getItem(`admin_token_${shareToken}`)
  );
  const [editingParticipant, setEditingParticipant] = useState<any>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/events/${shareToken}`);
        const ev = await res.json();
        setData(ev);
      } catch (err) { }
      setLoading(false);
    };
    fetchEvent();
    const interval = setInterval(fetchEvent, 10000);
    return () => clearInterval(interval);
  }, [shareToken]);

  // Auto-fetch admin token for creator on any device
  useEffect(() => {
    if (!data || !participantToken || adminToken) return;
    const currentUser = data.participants?.find((p: any) => p.participant_token === participantToken);
    if (!currentUser?.is_creator) return;
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/events/${shareToken}/admin-token`, {
      headers: { 'x-participant-token': participantToken }
    })
      .then(r => r.json())
      .then(d => {
        if (d.admin_token) {
          localStorage.setItem(`admin_token_${shareToken}`, d.admin_token);
          setAdminToken(d.admin_token);
        }
      })
      .catch(() => {});
  }, [data, participantToken, adminToken, shareToken]);

  const handleCopyNav = async () => {
    const url = `${window.location.host}/e/${shareToken}/join`;
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url).catch(()=>{});
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";
      document.body.prepend(textArea);
      textArea.select();
      try { document.execCommand('copy'); } catch (error) { console.error(error); }
      finally { textArea.remove(); }
    }
    setCopiedNav(true);
    setTimeout(() => setCopiedNav(false), 2000);
  };

  const handleSettle = async () => {
    await fetch(`${import.meta.env.VITE_API_URL || ''}/api/events/${shareToken}/settle`, { method: 'POST' });
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/events/${shareToken}`);
    setData(await res.json());
  };
  const revertEvent = async () => {
    await fetch(`${import.meta.env.VITE_API_URL || ''}/api/events/${shareToken}/revert`, { method: 'POST' });
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/events/${shareToken}`);
    setData(await res.json());
  };
  const toggleConsumer = async (itemId: string) => {
    if (!currentUser) return;
    // Optimistic update: flip the consumer list immediately
    setData((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        expenses: prev.expenses.map((e: any) => ({
          ...e,
          items: e.items.map((it: any) => {
            if (it.id !== itemId) return it;
            const alreadyIn = it.consumers.some((c: any) => c.id === currentUser.id);
            return {
              ...it,
              consumers: alreadyIn
                ? it.consumers.filter((c: any) => c.id !== currentUser.id)
                : [...it.consumers, { id: currentUser.id }]
            };
          })
        }))
      };
    });
    // Fire & forget, then reconcile with server truth
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/items/${itemId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participant_id: currentUser.id })
    }).then(() =>
      fetch(`${import.meta.env.VITE_API_URL || ''}/api/events/${shareToken}`)
        .then(r => r.json())
        .then(d => setData(d))
    );
  };

  const markPaid = async (debtId: string) => await fetch(`${import.meta.env.VITE_API_URL || ''}/api/debts/${debtId}/pay`, { method: 'POST' });
  const confirmPaid = async (debtId: string) => await fetch(`${import.meta.env.VITE_API_URL || ''}/api/debts/${debtId}/confirm`, { method: 'POST' });
  const closeEvent = async () => await fetch(`${import.meta.env.VITE_API_URL || ''}/api/events/${shareToken}/close`, { method: 'POST' });

  if (loading) return <div className="min-h-screen bg-[#fcf8f7] flex items-center justify-center font-heading text-lg text-primary">Cargando la parrilla...</div>;
  if (!data || data.error) return <div className="min-h-screen bg-[#fcf8f7] flex items-center justify-center font-heading text-lg text-primary">Asado no encontrado.</div>;

  const total_pool = data.expenses.reduce((sum: number, e: any) => sum + e.total_amount, 0);
  

  const currentUser = data.participants.find((p:any) => p.participant_token === participantToken);

  const renderNav = (activeTab: 'ASADO'|'GASTOS'|'DEUDAS'|'COMPARTIR') => (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#efece9] p-2 px-4 shadow-[0_-10px_40px_rgba(45,51,53,0.03)] flex justify-between items-center z-50 rounded-t-[2rem]">
      
      <div className={`flex flex-col items-center gap-1 w-20 py-2 rounded-2xl ${activeTab==='ASADO' ? 'bg-[#b83a0a] text-white shadow-md' : 'text-[#7a706b] hover:bg-[#e8ded8] transition-colors'} cursor-pointer`}>
        <Grill size={22} strokeWidth={activeTab==='ASADO'?2.5:2} className={activeTab==='ASADO'?'':'text-[#5a504b]'}/>
        <span className="text-[9px] font-bold tracking-wider uppercase">Asado</span>
      </div>
      
      <div className={`flex flex-col items-center gap-1 w-20 py-2 rounded-2xl ${activeTab==='GASTOS' ? 'bg-[#b83a0a] text-white shadow-md' : 'text-[#7a706b] hover:bg-[#e8ded8] transition-colors'} cursor-pointer`}>
        <Wallet size={22} strokeWidth={activeTab==='GASTOS'?2.5:2} className={activeTab==='GASTOS'?'':'text-[#5a504b]'}/>
        <span className="text-[9px] font-bold tracking-wider uppercase">Gastos</span>
      </div>

      <div className={`flex flex-col items-center gap-1 w-20 py-2 rounded-2xl ${activeTab==='DEUDAS' ? 'bg-[#b83a0a] text-white shadow-md' : 'text-[#7a706b] hover:bg-[#e8ded8] transition-colors'} cursor-pointer`}>
        <Receipt size={22} strokeWidth={activeTab==='DEUDAS'?2.5:2} className={activeTab==='DEUDAS'?'':'text-[#5a504b]'}/>
        <span className="text-[9px] font-bold tracking-wider uppercase">Deudas</span>
      </div>

      <div onClick={handleCopyNav} className={`flex flex-col items-center gap-1 w-20 py-2 rounded-2xl ${activeTab==='COMPARTIR' ? 'bg-[#b83a0a] text-white shadow-md' : 'text-[#7a706b] hover:bg-[#e8ded8] transition-colors'} cursor-pointer relative`}>
        <Share2 size={22} strokeWidth={activeTab==='COMPARTIR'?2.5:2} className={activeTab==='COMPARTIR'?'':'text-[#5a504b]'}/>
        <span className="text-[9px] font-bold tracking-wider uppercase">Compartir</span>
        {copiedNav && <div className="absolute -top-8 bg-black text-white text-[9px] px-2 py-1.5 rounded-md font-bold whitespace-nowrap animate-in fade-in zoom-in">Link Copiado</div>}
      </div>

    </nav>
  );

  const renderHeader = (isSaldado = false) => (
    <header className="flex items-center justify-between px-6 pt-[max(1.5rem,env(safe-area-inset-top,1.5rem))] pb-2">
      <div className="flex items-center gap-2">
         {isSaldado ? (
            <Link to="/" className="w-10 h-10 rounded-full bg-[#f2ece9] flex items-center justify-center"><ArrowLeft size={20}/></Link>
         ) : (
            <><Grill className="text-[#b83a0a]" fill="#b83a0a" size={24} /><span className="font-heading font-bold text-lg tracking-tight text-[#b83a0a] italic">Asadete</span></>
         )}
      </div>
     {/* DT badge or default avatar */}
      {currentUser?.is_creator && adminToken ? (
        <div className="flex items-center gap-2">
          <div className="relative flex flex-col items-center justify-center w-12 h-12 bg-[#b83a0a] rounded-b-full rounded-t-[30%] shadow-md">
            <span className="text-white text-[8px] font-black tracking-[0.2em] uppercase leading-none mt-1">DT</span>
            <div className="absolute -bottom-1 w-4 h-1 bg-[#b83a0a] rounded-b-sm" />
          </div>
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-[#e8ded8] flex items-center justify-center">
          <User size={18} fill="currentColor" className="text-[#7a706b]"/>
        </div>
      )}
    </header>
  );

  // ----------------------------------------------------
  // STATE 1: OPEN
  // ----------------------------------------------------
  if (data.status === 'open') {
    const allItems = data.expenses.flatMap((e:any) => e.items);
    
    const myShare = allItems.reduce((sum:number, it:any) => {
       if (it.consumers.length > 0) {
           return sum + (it.consumers.some((c:any) => c.id === currentUser?.id) ? (it.amount / it.consumers.length) : 0);
       } else {
           return sum + (it.amount / (data.participants.length || 1));
       }
    }, 0);

    return (
      <div className="min-h-screen bg-[#fcf8f7] flex flex-col font-body text-[#1f1a17] pb-32">
        {editingParticipant && adminToken && (
          <EditParticipantModal
            shareToken={shareToken!}
            adminToken={adminToken}
            participant={editingParticipant}
            initialExpenses={data.expenses.filter((e: any) => e.participant_id === editingParticipant.id)}
            onClose={() => setEditingParticipant(null)}
            onSaved={async () => {
              setEditingParticipant(null);
              const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/events/${shareToken}`);
              setData(await res.json());
            }}
          />
        )}
        {/* <Navbar title="Tu Asado Activo" /> */}
        {/* <Hero state="open" /> */}
        {renderHeader()} {/* Keeping renderHeader for now as Navbar/Hero are not provided */}

        <div className="px-5 mt-2 relative z-10 w-full max-w-md mx-auto flex-1">
          
          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-[#7a706b] text-xs font-bold mb-1 uppercase tracking-wider">Total Asadete</p>
                <h2 className="text-4xl font-heading font-extrabold tracking-tight text-[#b83a0a]">${total_pool.toLocaleString('es-AR')}</h2>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-[#e8ded8] mb-8">
            <div>
              <p className="text-[#7a706b] text-[10px] font-bold mb-1 uppercase tracking-wider">Tu cuota actual</p>
              <p className="font-heading font-extrabold text-[#1c7327] text-xl">${myShare.toLocaleString('es-AR', {minimumFractionDigits:0, maximumFractionDigits:2})}</p>
            </div>
            <div className="text-right">
              <p className="text-[#7a706b] text-[10px] font-bold mb-1 uppercase tracking-wider">Estado</p>
              <div className="bg-[#b83a0a]/10 text-[#b83a0a] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block">Asignando Gastos</div>
            </div>
          </div>

          {/* DT Admin strip — always visible for creators */}
          {adminToken && currentUser?.is_creator && (
            <div className="flex items-center justify-between bg-[#1f1a17] rounded-[1.25rem] px-5 py-3.5 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-white text-[9px] font-black tracking-[0.2em] uppercase bg-[#b83a0a] px-2 py-1 rounded-md">DT</span>
                <span className="text-white/80 text-[11px] font-bold">Modo Director Técnico</span>
              </div>
              <button
                onClick={() => setOpenTab('resumen')}
                className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-white bg-white/15 px-3 py-1.5 rounded-[0.5rem] hover:bg-white/25 transition-colors"
              >
                <Pencil size={12} /> Editar gastos
              </button>
            </div>
          )}

          <div className="flex bg-[#e8ded8] p-1 rounded-[1rem] mb-8 relative">
             <button onClick={() => setOpenTab('consumos')} className={`w-1/2 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-[0.8rem] z-10 transition-colors ${openTab === 'consumos' ? 'text-[#2b2725] bg-white shadow-sm' : 'text-[#7a706b] hover:text-[#2b2725]'}`}>Tu Consumo</button>
             <button onClick={() => setOpenTab('resumen')} className={`w-1/2 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-[0.8rem] z-10 transition-colors ${openTab === 'resumen' ? 'text-[#2b2725] bg-white shadow-sm' : 'text-[#7a706b] hover:text-[#2b2725]'}`}>Asignación</button>
          </div>

          {openTab === 'consumos' && allItems.length > 0 && (
            <div className="mb-8 animate-in slide-in-from-left-4 fade-in duration-300">
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-xl font-heading font-extrabold leading-6">Personalizá<br/>tu cuota</h3>
                <div className="flex gap-2">
                  <button onClick={() => {
                        const myExp = data.expenses.filter((e:any) => e.participant_id === currentUser?.id);
                        const myItems = myExp.flatMap((e:any) => e.items).map((it:any) => ({ name: it.name, amount: it.amount.toString() }));
                        navigate(`/e/${shareToken}/join?edit=true`, { state: { name: currentUser?.name, alias: currentUser?.alias, items: myItems } });
                  }} className="text-[10px] font-bold tracking-widest uppercase text-[#b83a0a] bg-[#b83a0a]/10 px-3 py-1.5 rounded-[0.5rem] hover:bg-[#b83a0a]/20 transition-colors">Editar mis gastos</button>
                </div>
              </div>
              <div className="bg-[#fcf8f7] border border-[#e8ded8] rounded-[1.5rem] p-5 space-y-3 shadow-sm">
                <p className="text-xs text-[#7a706b] mb-4 font-medium leading-relaxed">Destildá lo que no consumiste tocando el ítem. Tu cuota se va a descontar proporcionalmente y el resto la absorberá.</p>
                {allItems.map((it:any) => {
                   const isConsuming = it.consumers.some((c:any) => c.id === currentUser?.id);
                   return (
                     <div key={it.id} onClick={() => toggleConsumer(it.id)} className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.98] ${isConsuming ? 'bg-white border-[#f2ece9] shadow-sm' : 'bg-[#e8ded8]/30 border-transparent opacity-70'}`}>
                        <div className="flex items-center gap-3">
                           <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${isConsuming ? 'bg-[#1c7327] text-white' : 'bg-[#d9d2ce] text-[#7a706b]'}`}>
                              {isConsuming ? <Check size={14} strokeWidth={4}/> : <X size={14} strokeWidth={4}/>}
                           </div>
                           <span className={`font-bold text-sm ${isConsuming ? 'text-[#2b2725]' : 'text-[#7a706b] line-through decoration-[#a39a95]'}`}>{it.name}</span>
                        </div>
                        <div className="text-right">
                           <p className={`font-bold text-sm ${isConsuming ? 'text-[#1c7327]' : 'text-[#7a706b]'}`}>${it.amount.toLocaleString('es-AR')}</p>
                           <p className="text-[9px] text-[#7a706b] font-bold uppercase tracking-widest mt-0.5">{it.consumers.length} comparten</p>
                        </div>
                     </div>
                   )
                })}
              </div>
            </div>
          )}

          {openTab === 'resumen' && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="flex justify-between items-center mb-6 px-1">
              <h3 className="text-xl font-heading font-extrabold leading-6">Resumen de<br/>asignación</h3>
            </div>
                    <div className="space-y-4">
              {data.participants.map((p:any) => {
                const participantPaid = data.expenses.filter((e:any) => e.participant_id === p.id).reduce((sum:number, e:any) => sum + e.total_amount, 0);
                const itemsConsumed = allItems.filter((it:any) => it.consumers.length === 0 || it.consumers.some((c:any) => c.id === p.id));
                const participantOwesTotal = itemsConsumed.reduce((sum:number, it:any) => {
                     return sum + (it.consumers.length === 0 ? (it.amount / (data.participants.length || 1)) : (it.amount / it.consumers.length));
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
                             <p className="text-[12px] font-bold text-[#b83a0a] uppercase tracking-widest">
                                Compras: ${participantPaid.toLocaleString('es-AR', {minimumFractionDigits:0, maximumFractionDigits:2})}
                             </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           {adminToken && currentUser?.is_creator && (
                             <button
                               onClick={() => setEditingParticipant(p)}
                               className="w-9 h-9 rounded-full bg-[#b83a0a]/10 flex items-center justify-center text-[#b83a0a] hover:bg-[#b83a0a]/20 transition-colors"
                             >
                               <Pencil size={15} strokeWidth={2.5} />
                             </button>
                           )}
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-[#7a706b] uppercase tracking-widest mb-0.5">Cuota DT</p>
                              <p className="font-heading font-bold text-xl">${participantOwesTotal.toLocaleString('es-AR', {minimumFractionDigits:0, maximumFractionDigits:2})}</p>
                           </div>
                        </div>
                    </div>

                    {/* Breakdown de Consumos DT */}
                    {itemsConsumed.length > 0 && (
                      <div className="bg-[#fcf8f7] border border-[#e8ded8] rounded-xl p-3 mb-6">
                        <p className="text-[9px] text-[#7a706b] uppercase font-bold tracking-widest mb-2 px-1">Detalle de consumos</p>
                        <div className="space-y-1.5">
                          {itemsConsumed.map((it:any, idx:number) => {
                            const isFallback = it.consumers.length === 0;
                            const frac = isFallback ? (it.amount / (data.participants.length || 1)) : (it.amount / it.consumers.length);
                            return (
                              <div key={idx} className="flex justify-between items-center text-[11px] font-semibold text-[#5a504b] px-1">
                                <span className="flex items-center gap-1.5"><ShoppingBag size={10} className="text-[#b83a0a]/50"/> {it.name} <span className="text-[9px] text-[#a39a95]">({isFallback ? 'todos' : `${it.consumers.length} pers`})</span></span>
                                <span>${frac.toLocaleString('es-AR', {minimumFractionDigits:0, maximumFractionDigits:2})}</span>
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
                    <button onClick={handleSettle} className="w-full py-5 bg-[#b83a0a] text-white rounded-[1.25rem] text-[15px] font-heading font-bold transition-transform active:scale-[0.98] shadow-[0_8px_30px_rgba(184,58,10,0.3)] flex justify-center items-center gap-2 hover:bg-[#8a2905]">
                    <PanelTopClose size={20}/> LIQUIDAR ASADETE
                    </button>
                    <p className="text-[9px] text-center text-[#7a706b] font-bold mt-4 uppercase tracking-widest">Solo el DT de la fecha puede cerrar la cuenta</p>
                 </div>
              </div>
            ) : (
               <p className="text-[10px] text-center text-[#b83a0a] bg-[#fcf8f7] border border-[#f2ece9] p-4 rounded-xl font-bold mt-8 uppercase tracking-widest">Esperando que el DT liquide la cuenta...</p>
            )}

          </div>
          )}
        </div>
        {renderNav('GASTOS')}
      </div>
    );
  }
  // ----------------------------------------------------
  // STATE 2: SETTLED
  // ----------------------------------------------------
  if (data.status === 'settled') {
    const relevantDebts = currentUser ? data.debts.filter((d:any) => d.from_participant_id === currentUser.id || d.to_participant_id === currentUser.id) : data.debts;
    const confirmedDebtsTotal = data.debts.filter((d:any) => d.status === 'confirmed').reduce((sum:number, d:any) => sum + d.amount, 0);
    const totalDebtsAmount = data.debts.reduce((sum:number, d:any) => sum + d.amount, 0);
    const progressPercent = totalDebtsAmount > 0 ? Math.round((confirmedDebtsTotal/totalDebtsAmount)*100) : 100;

    return (
      <div className="min-h-screen bg-[#fcf8f7] flex flex-col font-body text-[#1f1a17] pb-32">
        {renderHeader()}
        <div className="px-6 py-4 max-w-md mx-auto w-full space-y-8 animate-in fade-in">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#b83a0a] mb-2">Resumen de Liquidación</p>
            <h1 className="text-4xl font-heading font-extrabold tracking-tight mb-4 leading-[1.1]">Cuentas claras,<br/>amistad eterna.</h1>
            <h2 className="text-[44px] font-heading font-bold tracking-tighter flex items-center gap-3">
                <span className="text-2xl mt-1">$</span>{total_pool.toLocaleString(undefined, {minimumFractionDigits:0})} <span className="text-[11px] font-bold text-[#5a504b] uppercase tracking-widest mt-2">balance total</span>
            </h2>
          </div>

          <div className="space-y-8">
            {/* PENDIENTES GROUP */}
            {relevantDebts.some((d:any)=>currentUser?.id === d.from_participant_id && d.status !== 'confirmed') && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-heading font-extrabold flex items-center gap-2">Tenés que pagar</h3>
                    <span className="bg-[#f8dfd8] text-[#b83a0a] text-[9px] font-extrabold px-3 py-1 rounded-full tracking-widest uppercase">PENDIENTE</span>
                </div>
                <div className="space-y-4">
                {relevantDebts.map((debt:any) => {
                  const amIDebtor = currentUser && currentUser.id === debt.from_participant_id;
                  if (!amIDebtor || debt.status === 'confirmed') return null;
                  const isPaid = debt.status === 'paid';
                  return (
                    <div key={debt.id} className="bg-[#f7f2ef] rounded-2xl p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <div className="w-11 h-11 rounded-full bg-[#ffddcd] flex items-center justify-center text-black">
                              <User size={20} fill="currentColor"/>
                           </div>
                           <div>
                             <p className="font-heading font-extrabold text-[15px]">{debt.to_participant.name}</p>
                             <p className="text-[11px] text-[#7a706b]">Por los gastos compartidos</p>
                             {debt.to_participant.alias && <p className="text-[10px] text-[#b83a0a] font-mono mt-0.5">{debt.to_participant.alias}</p>}
                           </div>
                        </div>
                        <span className="font-heading font-bold text-xl text-[#b83a0a]">${debt.amount.toLocaleString()}</span>
                      </div>
                      <button disabled={isPaid} onClick={() => markPaid(debt.id)} className={`w-full py-4 text-white rounded-[0.8rem] text-sm font-bold flex justify-center items-center gap-2 transition-all ${isPaid ? 'bg-[#d9d2ce] text-[#7a706b]' : 'bg-[#b83a0a] hover:bg-[#8a2905]'}`}>
                        <Check size={18} strokeWidth={3}/> {isPaid ? 'Esperando confirmación' : 'Marcar como Pagado'}
                      </button>
                    </div>
                  );
                })}
                </div>
              </div>
            )}

            {/* A FAVOR GROUP */}
            {relevantDebts.some((d:any)=>currentUser?.id === d.to_participant_id && d.status !== 'confirmed') && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-heading font-extrabold flex items-center gap-2">Vas a recibir</h3>
                    <span className="bg-[#e8ded8] text-[#5a504b] text-[9px] font-extrabold px-3 py-1 rounded-full tracking-widest uppercase">A FAVOR</span>
                </div>
                <div className="space-y-4">
                {relevantDebts.map((debt:any) => {
                  const amICreditor = currentUser && currentUser.id === debt.to_participant_id;
                  if (!amICreditor || debt.status === 'confirmed') return null;
                  const isPaid = debt.status === 'paid';
                  return (
                    <div key={debt.id} className="bg-[#f7f2ef] rounded-2xl p-4 space-y-4 relative overflow-hidden">
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isPaid ? 'bg-[#1c7327]' : 'bg-[#d9d2ce]'}`}></div>
                      <div className="flex justify-between items-center pl-2">
                        <div className="flex items-center gap-3">
                           <div className={`w-11 h-11 rounded-full flex items-center justify-center ${isPaid ? 'bg-[#96f39e] text-[#1c7327]' : 'bg-[#e8ded8] text-[#5a504b]'}`}>
                              <User size={20} fill="currentColor"/>
                           </div>
                           <div>
                             <p className="font-heading font-extrabold text-[15px]">{debt.from_participant.name}</p>
                             <p className="text-[11px] text-[#7a706b]">Por los gastos compartidos</p>
                           </div>
                        </div>
                        <span className={`font-heading font-bold text-xl ${isPaid ? 'text-[#1c7327]' : 'text-[#2b2725]'}`}>${debt.amount.toLocaleString()}</span>
                      </div>
                      <button disabled={!isPaid} onClick={() => confirmPaid(debt.id)} className={`w-full py-4 text-white rounded-[0.8rem] text-sm font-bold flex justify-center items-center gap-2 transition-all ${!isPaid ? 'bg-[#d9d2ce] text-[#7a706b]' : 'bg-[#135c1d] hover:bg-black'}`}>
                        <Receipt size={18} strokeWidth={3}/> {!isPaid ? 'Aún no transfirió' : 'Confirmar Recepción'}
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
                <button 
                  onClick={revertEvent}
                  className="w-full py-3.5 text-[12px] font-bold tracking-widest uppercase text-[#b83a0a] hover:text-[#8a2905] transition-colors flex items-center justify-center gap-1.5 border border-[#b83a0a]/30 bg-[#f5e4df]/50 rounded-[1rem]">
                  Des-liquidar <History size={16}/>
                </button>
                <button 
                  onClick={closeEvent}
                  className="w-full py-3.5 text-[12px] font-bold tracking-widest uppercase text-[#5a504b] hover:text-[#b83a0a] transition-colors flex items-center justify-center gap-1.5 border border-transparent bg-[#e8ded8] rounded-[1rem]">
                  Archivar Asado <X size={16}/>
                </button>
            </div>
          )}
        </div>
        {renderNav('DEUDAS')}
      </div>
    );
  }

  // ----------------------------------------------------
  // STATE 3: CLOSED
  // ----------------------------------------------------
  if (data.status === 'closed') {
    const allItems = data.expenses.flatMap((e:any) => e.items);


    return (
      <div className="min-h-screen bg-[#fcf8f7] flex flex-col font-body text-[#1f1a17] mb-8">
        {renderHeader(true)}
        <div className="px-6 py-8 flex-1 flex flex-col items-center max-w-md mx-auto w-full text-center space-y-10 animate-in fade-in">
          
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-white shadow-xl shadow-[#b83a0a]/5 flex items-center justify-center mx-auto mb-8 border border-[#e8ded8] relative z-10">
               <Grill className="text-[#b83a0a]" fill="#b83a0a" size={56}/>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#f5e4df]/50 rounded-full blur-3xl -z-10"></div>
            <h1 className="text-[40px] font-heading font-extrabold tracking-tight leading-10 mb-4 text-[#1f1a17]">¡Un aplauso<br/>para el DT!</h1>
            <p className="text-[#5a504b] text-sm font-medium">El ritual ha concluido con éxito.</p>
          </div>

          <div className="w-full bg-[#fcf8f7] border border-[#d9d2ce] rounded-[1.5rem] p-6 flex justify-between items-center text-left">
              <div>
                   <p className="text-[10px] font-bold tracking-widest uppercase text-[#7a706b] mb-1">Estado del encuentro</p>
                   <h2 className="text-xl font-heading font-bold text-[#1c7327]">Asado Saldado</h2>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#96f39e]/50 flex items-center justify-center text-[#1c7327]">
                  <Check size={24} strokeWidth={3}/>
              </div>
          </div>

          {showSummary && (
              <div className="w-full bg-white rounded-[1.5rem] p-6 text-left border border-[#e8ded8] shadow-sm animate-in hidden-to-visible zoom-in-95 fade-in duration-200">
                  <h3 className="text-lg font-heading font-extrabold mb-4 text-[#1f1a17]">Balance Final</h3>
                  <div className="space-y-4">
                      {data.participants.map((p:any) => {
                          const participantPaid = data.expenses.filter((e:any) => e.participant_id === p.id).reduce((sum:number, e:any) => sum + e.total_amount, 0);
                          const itemsConsumed = allItems.filter((it:any) => it.consumers.length === 0 || it.consumers.some((c:any) => c.id === p.id));
                          const participantOwesTotal = itemsConsumed.reduce((sum:number, it:any) => {
                               return sum + (it.consumers.length === 0 ? (it.amount / (data.participants.length || 1)) : (it.amount / it.consumers.length));
                          }, 0);
                          
                          return (
                              <div key={p.id} className="border-b border-[#f2ece9] pb-4 last:border-0 last:pb-0">
                                  <div className="flex justify-between items-start mb-2 mt-2">
                                      <div>
                                          <p className="font-heading font-extrabold text-[15px] text-[#2b2725]">{p.name}</p>
                                          <p className="text-[10px] font-bold text-[#1c7327] uppercase tracking-wide mt-0.5">En compras: ${participantPaid.toLocaleString('es-AR', {minimumFractionDigits:0, maximumFractionDigits:2})}</p>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-[10px] text-[#7a706b] uppercase tracking-wide mb-0.5">Cuota DT</p>
                                          <p className="font-heading font-bold text-[15px] text-[#b83a0a]">${participantOwesTotal.toLocaleString('es-AR', {minimumFractionDigits:0, maximumFractionDigits:2})}</p>
                                      </div>
                                  </div>
                                  
                                  {itemsConsumed.length > 0 ? (
                                      <div className="mt-3 bg-[#fcf8f7] rounded-lg p-2.5 space-y-1.5 border border-[#f2ece9]">
                                          {itemsConsumed.map((it:any, idx:number) => {
                                              const isFallback = it.consumers.length === 0;
                                              const frac = isFallback ? (it.amount / (data.participants.length || 1)) : (it.amount / it.consumers.length);
                                              return (
                                                <div key={idx} className="flex justify-between items-center text-[11px] text-[#5a504b]">
                                                    <span className="flex items-center gap-1.5 font-medium"><ShoppingBag size={12} className="text-[#d9d2ce]"/> {it.name}</span>
                                                    <span className="font-bold">${frac.toLocaleString('es-AR', {minimumFractionDigits:0, maximumFractionDigits:2})}</span>
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
              <h3 className="text-lg font-heading font-extrabold flex items-center gap-2 mb-3 text-[#1f1a17]"><Heart className="text-[#b83a0a] fill-[#b83a0a]" size={20}/> Mantené vivo el fuego</h3>
              <p className="text-xs text-[#5a504b] font-medium leading-relaxed mb-6">Si disfrutaste la app, podés dejar una pequeña colaboración para seguir mejorando las herramientas del asador.</p>
              
              <div className="grid grid-cols-3 gap-3 mb-2">
                  <div className="bg-white rounded-[1.25rem] p-4 text-center shadow-sm border border-[#e8ded8]">
                      <p className="text-[10px] text-[#7a706b] mb-1">Chico</p>
                      <p className="font-heading font-bold text-[15px]">$500</p>
                  </div>
                  <div className="bg-white rounded-[1.25rem] p-4 text-center border-2 border-[#b83a0a] shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
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
                  <Plus size={20} className="bg-white text-[#b83a0a] rounded-full p-0.5"/> Nuevo Asado
              </Link>
              <button onClick={() => setShowSummary(!showSummary)} className="w-full py-5 bg-transparent border-[1.5rem] border-[#e8ded8] bg-[#fcf8f7] border-2 text-[#2b2725] rounded-[1.25rem] text-sm font-heading font-bold flex justify-center items-center gap-2 hover:bg-[#efece9] transition-colors">
                  <Receipt size={18}/> {showSummary ? 'Ocultar Resumen' : 'Ver Resumen Final'}
              </button>
          </div>

        </div>
      </div>
    );
  }

  // Fallback si no machea ningún estado
  return null;
}
