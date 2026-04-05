import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Copy, Check, Link as LinkIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Grill from '../components/Grill';
import BottomNav from '../components/BottomNav';
import PageLayout from '../components/PageLayout';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import SectionLabel from '../components/SectionLabel';
import { Button } from '../components/ui/button';
import { api } from '../lib/api';
import { useCopyLink } from '../hooks/useCopyLink';

export default function CreateEvent() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<{ share_token: string } | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'ready' | 'slow'>('checking');

  useEffect(() => {
    const BASE = import.meta.env.VITE_API_URL || '';
    const slowTimer = setTimeout(() => setServerStatus('slow'), 2000);
    fetch(`${BASE}/ping`)
      .then(() => { clearTimeout(slowTimer); setServerStatus('ready'); })
      .catch(() => { clearTimeout(slowTimer); setServerStatus('slow'); });
    return () => clearTimeout(slowTimer);
  }, []);

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
      toast.success('¡Asado creado!');
    } catch {
      toast.error('No se pudo crear el asado. Intentá de nuevo.');
    }
    setLoading(false);
  };

  return (
    <PageLayout center>
      <AppHeader variant="large" />

      <div className="w-full max-w-md px-6 pt-4 animate-in fade-in">
        {!createdEvent ? (
          <div className="bg-gradient-to-b from-secondary to-surfaceDark rounded-hero p-8 flex flex-col items-center relative overflow-hidden mb-8 border border-white/[0.06] shadow-modal">
            <img
              src="/logo-parrilla.png"
              alt="asaDeTe"
              className="w-36 h-36 object-contain mb-6 relative z-10"
              style={{ filter: 'hue-rotate(-25deg) saturate(1.4) brightness(1.05)' }}
            />

            <SectionLabel variant="primary" className="mb-3 relative z-10">¡Hola, Prepará la táctica!</SectionLabel>
            <h1 className="text-[36px] font-heading font-extrabold tracking-tight text-white mb-3 relative z-10 leading-[1.05] text-center">¿Sale ese<br />asado?</h1>
            <p className="text-white/50 text-[13px] font-medium leading-relaxed mb-8 relative z-10 text-center">Organizá los gastos, las deudas y el<br />fuego en un toque.</p>

            {serverStatus === 'slow' && (
              <div className="flex items-center gap-2 text-[11px] font-medium text-white/40 mb-3 relative z-10 justify-center animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-primaryBright/60 animate-pulse flex-shrink-0" />
                Iniciando servidor, ya casi...
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full relative z-10 space-y-4">
              <input
                required
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Asado del Domingo"
                className="w-full bg-white/10 border border-white/10 rounded-inner p-4 text-center focus:outline-none focus:ring-2 focus:ring-primaryBright/40 text-white font-medium placeholder:text-white/30"
              />
              <Button type="submit" disabled={loading || !name.trim()} className="w-full">
                <span className="bg-white text-primary rounded-full w-5 h-5 flex items-center justify-center text-lg leading-none pt-0.5 pb-1">+</span>
                {loading ? 'Creando...' : 'CREAR ASADO'}
              </Button>
            </form>
          </div>
        ) : (
          <div className="bg-gradient-to-b from-secondary to-surfaceDark rounded-hero p-8 flex flex-col items-center relative overflow-hidden mb-8 animate-in fade-in zoom-in-95 border border-white/[0.06] shadow-modal">
            <img
              src="/logo-parrilla.png"
              alt="asaDeTe"
              className="w-24 h-24 object-contain mb-5 relative z-10 opacity-80"
              style={{ filter: 'hue-rotate(-25deg) saturate(1.4) brightness(1.05)' }}
            />
            <span className="bg-successBg/20 text-successBg text-[9px] font-extrabold px-3 py-1 rounded-full tracking-widest uppercase mb-5 relative z-10 border border-successBg/20">ACTIVO</span>
            <h1 className="text-[32px] font-heading font-extrabold tracking-tight text-white relative z-10 leading-tight mb-2 text-center">{name}</h1>
            <p className="text-white/50 text-[13px] font-medium relative z-10">Tu asado está listo para arrancar.</p>
          </div>
        )}

        {createdEvent && (
          <div className="animate-in fade-in slide-in-from-top-4 space-y-6">
            <Card className="p-6 flex flex-col items-center">
              <div className="p-2 border-[1.5px] border-outlineVariant rounded-xl mb-4">
                <QRCodeSVG value={getJoinUrl()} size={160} bgColor="#ffffff" fgColor="#3b3836" level="M" />
              </div>
              <SectionLabel>Escaneá para unirte</SectionLabel>
            </Card>

            <Card variant="muted" className="p-6 space-y-4">
              <SectionLabel variant="primary">Enlace del evento</SectionLabel>
              <div className="w-full bg-surface rounded-inner p-4 flex justify-between items-center text-xs font-medium text-onSurfaceVariant shadow-sm">
                <span className="truncate pr-4">{window.location.origin}/e/{createdEvent.share_token}</span>
                <LinkIcon size={16} className="text-primary flex-shrink-0" />
              </div>
              <Button
                variant="secondary"
                onClick={() => copy(getJoinUrl())}
                className="w-full"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? '¡COPIADO!' : 'COPIAR ENLACE'}
              </Button>
            </Card>

            <div className="pb-32">
              <Button
                onClick={() => navigate(`/e/${createdEvent.share_token}/join`, { state: { eventName: name } })}
                className="w-full"
              >
                Sumarme yo también <Grill size={20} className="text-white" />
              </Button>
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
    </PageLayout>
  );
}
