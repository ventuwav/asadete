import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, Link as LinkIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Grill from '../components/Grill';
import BottomNav from '../components/BottomNav';
import { api } from '../lib/api';
import { useCopyLink } from '../hooks/useCopyLink';

export default function CreateEvent() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<{ share_token: string } | null>(null);
  const { copied, copy } = useCopyLink();
  const { copied: copiedNav, copy: copyNav } = useCopyLink();
  const navigate = useNavigate();

  const getJoinUrl = () => createdEvent ? `${window.location.origin}/e/${createdEvent.share_token}/join` : '';

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const data = await api.events.create({ name });
      if (data.admin_token) {
        localStorage.setItem(`admin_token_${data.share_token}`, data.admin_token);
      }
      setCreatedEvent(data);
    } catch {
      alert('Error creando asado');
    }
    setLoading(false);
  };

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
            <Grill size={200} />
          </div>
          <p className="text-[#b83a0a] font-bold tracking-widest uppercase text-[10px] mb-2 relative z-10">¡Hola, Prepará la táctica!</p>
          <h1 className="text-[32px] font-heading font-extrabold tracking-tight text-[#1f1a17] mb-3 relative z-10 leading-[1.1]">¿Sale ese<br />asado?</h1>
          <p className="text-[#5a504b] text-[13px] font-medium leading-relaxed mb-6 relative z-10">Organizá los gastos, las deudas y el<br />fuego en un toque.</p>

          <form onSubmit={handleSubmit} className="w-full relative z-10 space-y-4">
            {!createdEvent && (
              <input required autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Asado del Domingo" className="w-full bg-[#f2ece9] border-transparent rounded-[1rem] p-4 text-center focus:outline-none focus:ring-2 focus:ring-[#b83a0a]/30 text-[#1f1a17] font-medium placeholder:text-[#d9d2ce]" />
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
              <div className="p-2 border-[1.5px] border-[#e8ded8] rounded-xl mb-4">
                <QRCodeSVG value={getJoinUrl()} size={160} bgColor="#ffffff" fgColor="#3b3836" level="M" />
              </div>
              <p className="text-[#7a706b] text-[10px] uppercase font-bold tracking-widest">ESCANEÁ PARA UNIRTE</p>
            </div>

            <div className="bg-[#e8ded8]/50 rounded-[1.5rem] p-6 space-y-4">
              <label className="text-[10px] font-bold tracking-widest uppercase text-[#b83a0a]">ENLACE DEL EVENTO</label>
              <div className="w-full bg-[#fcf8f7] rounded-[1rem] p-4 flex justify-between items-center text-xs font-medium text-[#7a706b] shadow-sm">
                <span className="truncate pr-4">{window.location.origin}/e/{createdEvent.share_token}</span>
                <LinkIcon size={16} className="text-[#b83a0a] flex-shrink-0" />
              </div>
              <button onClick={() => copy(getJoinUrl())} className="w-full py-4 bg-[#1f1a17] text-white rounded-[1rem] text-sm font-heading font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors">
                {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? '¡COPIADO!' : 'COPIAR ENLACE'}
              </button>
            </div>

            <div className="pb-32">
              <button
                onClick={() => navigate(`/e/${createdEvent.share_token}/join`, { state: { eventName: name } })}
                className="w-full py-5 bg-[#b83a0a] text-white rounded-[1.25rem] text-[15px] font-heading font-bold shadow-[0_8px_30px_rgba(184,58,10,0.3)] flex justify-center items-center gap-2 hover:bg-[#8a2905] transition-all active:scale-[0.98]"
              >
                Sumarme yo también <Grill size={20} className="text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav
        activeTab="ASADO"
        onGastos={() => createdEvent && navigate(`/e/${createdEvent.share_token}`)}
        onDeudas={() => createdEvent && navigate(`/e/${createdEvent.share_token}`)}
        onCompartir={() => copyNav(getJoinUrl())}
        onAyuda={() => navigate('/ayuda')}
        copiedLink={copiedNav}
      />
    </div>
  );
}
