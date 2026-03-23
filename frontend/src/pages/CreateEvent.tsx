import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, Receipt, Link as LinkIcon, Wallet, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const Grill = ({ size = 24, className = "", strokeWidth = 2, fill = "none" }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 5v2" /><path d="M12 3v4" /><path d="M16 5v2" />
    <path d="M4 11h16a8 8 0 0 1-16 0Z" />
    <line x1="2" y1="11" x2="22" y2="11" />
    <line x1="7" y1="18.5" x2="5" y2="22" />
    <line x1="17" y1="18.5" x2="19" y2="22" />
  </svg>
);

export default function CreateEvent() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<{share_token: string} | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedNav, setCopiedNav] = useState(false);
  const navigate = useNavigate();
  
  const safeCopy = async (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text).catch(()=>{});
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";
      document.body.prepend(textArea);
      textArea.select();
      try { document.execCommand('copy'); } catch (error) { console.error(error); }
      finally { textArea.remove(); }
    }
  };

  const handleCopy = async () => {
    if (!createdEvent) return;
    const url = `${window.location.host}/e/${createdEvent.share_token}/join`;
    await safeCopy(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyNav = async () => {
    if (!createdEvent) return;
    const url = `${window.location.host}/e/${createdEvent.share_token}/join`;
    await safeCopy(url);
    setCopiedNav(true);
    setTimeout(() => setCopiedNav(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      
      if (data.admin_token) {
        localStorage.setItem(`admin_token_${data.share_token}`, data.admin_token);
      }
      
      if (data.share_token) {
        setCreatedEvent(data);
      }
    } catch (error) {
      console.error(error);
      alert('Error creando asado');
    }
    setLoading(false);
  };

  const renderNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#efece9] p-2 px-4 shadow-[0_-10px_40px_rgba(45,51,53,0.03)] flex justify-between items-center z-50 rounded-t-[2rem]">
      <div className="flex flex-col items-center gap-1 w-20 py-2 rounded-2xl bg-[#b83a0a] text-white shadow-md cursor-pointer">
        <Grill size={22} strokeWidth={2.5} />
        <span className="text-[9px] font-bold tracking-wider uppercase">Asado</span>
      </div>
      
      <div className="flex flex-col items-center gap-1 w-20 py-2 rounded-2xl text-[#7a706b] hover:bg-[#e8ded8] transition-colors cursor-pointer" onClick={() => createdEvent && navigate(`/e/${createdEvent.share_token}`)}>
        <Wallet size={22} strokeWidth={2} className="text-[#5a504b]"/>
        <span className="text-[9px] font-bold tracking-wider uppercase">Gastos</span>
      </div>

      <div className="flex flex-col items-center gap-1 w-20 py-2 rounded-2xl text-[#7a706b] hover:bg-[#e8ded8] transition-colors cursor-pointer" onClick={() => createdEvent && navigate(`/e/${createdEvent.share_token}`)}>
        <Receipt size={22} strokeWidth={2} className="text-[#5a504b]"/>
        <span className="text-[9px] font-bold tracking-wider uppercase">Deudas</span>
      </div>

      <div onClick={handleCopyNav} className="flex flex-col items-center gap-1 w-20 py-2 rounded-2xl text-[#7a706b] hover:bg-[#e8ded8] transition-colors cursor-pointer relative">
        <Share2 size={22} strokeWidth={2} className="text-[#5a504b]"/>
        <span className="text-[9px] font-bold tracking-wider uppercase">Compartir</span>
        {copiedNav && <div className="absolute -top-8 bg-black text-white text-[9px] px-2 py-1.5 rounded-md font-bold whitespace-nowrap animate-in fade-in zoom-in">Link Copiado</div>}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#fcf8f7] flex flex-col items-center font-body text-[#1f1a17] pb-32">
      
      <header className="w-full max-w-md flex flex-col items-center justify-center p-6 pb-2 pt-8">
        <div className="bg-gradient-to-br from-white to-[#fcf8f7] w-20 h-20 mb-3 rounded-[1.5rem] flex items-center justify-center shadow-md border border-[#e8ded8]/50">
           <Grill className="text-[#b83a0a]" fill="#b83a0a" size={40} />
        </div>
        <span className="font-heading font-extrabold text-3xl tracking-tight text-[#b83a0a] italic leading-none">Asadete</span>
        <span className="text-[#5a504b] font-bold text-[10px] tracking-widest uppercase mt-2">El DT de tu asado</span>
      </header>

      <div className="w-full max-w-md px-6 pt-4 animate-in fade-in">
        
        <div className="bg-gradient-to-b from-white to-[#fcf8f7] rounded-[2rem] p-8 text-center flex flex-col items-center relative overflow-hidden mb-8 shadow-[0_10px_40px_rgba(45,51,53,0.03)] border border-[#e8ded8]/50">
            <div className="absolute right-0 bottom-0 opacity-5 scale-150 translate-x-1/4 translate-y-1/4">
                <Grill size={200}/>
            </div>

            <p className="text-[#b83a0a] font-bold tracking-widest uppercase text-[10px] mb-2 relative z-10">¡Hola, Prepará la táctica!</p>
            <h1 className="text-[32px] font-heading font-extrabold tracking-tight text-[#1f1a17] mb-3 relative z-10 leading-[1.1]">¿Sale ese<br/>asado?</h1>
            <p className="text-[#5a504b] text-[13px] font-medium leading-relaxed mb-6 relative z-10">Organizá los gastos, las deudas y el<br/>fuego en un toque.</p>
            
            <form onSubmit={handleSubmit} className="w-full relative z-10 space-y-4">
                {!createdEvent && (
                    <input required autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Asado del Domingo" className="w-full bg-[#f2ece9] border-transparent rounded-[1rem] p-4 text-center focus:outline-none focus:ring-2 focus:ring-[#b83a0a]/30 text-[#1f1a17] font-medium placeholder:text-[#d9d2ce]"/>
                )}
                <button type="submit" disabled={loading || (!name.trim() && !createdEvent) || !!createdEvent} className="w-full py-4 bg-[#b83a0a] text-white rounded-[1.25rem] text-[15px] font-heading font-bold transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(184,58,10,0.3)] hover:bg-[#8a2905] disabled:opacity-50">
                  <span className="bg-white text-[#b83a0a] rounded-full w-5 h-5 flex items-center justify-center text-lg leading-none pt-0.5 pb-1">+</span> CREAR ASADO
                </button>
            </form>
        </div>

        {createdEvent && (
            <div className="animate-in fade-in slide-in-from-top-4 space-y-6">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-[17px] font-heading font-extrabold">Tu Asado está listo</h2>
                    <span className="bg-[#e8efea] text-[#1c7327] text-[9px] font-extrabold px-3 py-1 rounded-full tracking-widest uppercase">ACTIVO</span>
                </div>

                <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-[#e8ded8]/50 flex flex-col items-center">
                    <div className="p-2 border-[1.5px] border-[#e8ded8] rounded-xl mb-4 relative flex items-center justify-center">
                        <QRCodeSVG 
                            value={`${window.location.origin}/e/${createdEvent.share_token}/join`} 
                            size={160}
                            bgColor={"#ffffff"}
                            fgColor={"#3b3836"}
                            level={"M"}
                        />
                    </div>
                    <p className="text-[#7a706b] text-[10px] uppercase font-bold tracking-widest">ESCANEÁ PARA UNIRTE</p>
                </div>

                <div className="bg-[#e8ded8]/50 rounded-[1.5rem] p-6 space-y-4">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-[#b83a0a]">ENLACE DEL EVENTO</label>
                    <div className="w-full bg-[#fcf8f7] rounded-[1rem] p-4 flex justify-between items-center text-xs font-medium text-[#7a706b] shadow-sm">
                        <span className="truncate pr-4">{window.location.host}/e/{createdEvent.share_token}</span>
                        <LinkIcon size={16} className="text-[#b83a0a] flex-shrink-0" />
                    </div>
                    <button onClick={handleCopy} className="w-full py-4 bg-[#1f1a17] text-white rounded-[1rem] text-sm font-heading font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors">
                        {copied ? <Check size={18}/> : <Copy size={18}/>} {copied ? '¡COPIADO!' : 'COPIAR ENLACE'}
                    </button>
                </div>


                <div className="pb-32">
                    <button
                      onClick={() => navigate(`/e/${createdEvent.share_token}/join`, { state: { eventName: name } })}
                      className="w-full py-5 bg-[#b83a0a] text-white rounded-[1.25rem] text-[15px] font-heading font-bold shadow-[0_8px_30px_rgba(184,58,10,0.3)] flex justify-center items-center gap-2 hover:bg-[#8a2905] transition-all active:scale-[0.98]"
                    >
                        Sumarme yo también <Grill size={20} className="text-white"/>
                    </button>
                </div>

            </div>
        )}
      </div>

      {renderNav()}
    </div>
  );
}
