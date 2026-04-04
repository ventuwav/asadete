import { Wallet, Receipt, Share2, MessageCircle } from 'lucide-react';
import Grill from './Grill';

export type NavTab = 'ASADO' | 'GASTOS' | 'DEUDAS' | 'COMPARTIR' | 'AYUDA';

interface BottomNavProps {
  activeTab: NavTab;
  onAsado?: () => void;
  onGastos?: () => void;
  onDeudas?: () => void;
  onCompartir?: () => void;
  onAyuda?: () => void;
  copiedLink?: boolean;
}

export default function BottomNav({
  activeTab,
  onAsado,
  onGastos,
  onDeudas,
  onCompartir,
  onAyuda,
  copiedLink = false
}: BottomNavProps) {
  const itemClass = (tab: NavTab) =>
    `flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] px-2 py-2 rounded-2xl transition-colors ${
      activeTab === tab
        ? 'bg-primary text-white shadow-md'
        : 'text-onSurfaceVariant hover:bg-surfaceHighest'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surfaceHighest/80 backdrop-blur-md px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] shadow-[0_-10px_40px_rgba(45,51,53,0.03)] flex justify-between items-center z-50 rounded-t-[2rem]">
      <button aria-label="Asado" onClick={onAsado} className={itemClass('ASADO')}>
        <Grill size={20} strokeWidth={activeTab === 'ASADO' ? 2.5 : 2} />
        <span className="text-[8px] font-bold tracking-wider uppercase">Asado</span>
      </button>

      <button aria-label="Gastos" onClick={onGastos} className={itemClass('GASTOS')}>
        <Wallet size={20} strokeWidth={activeTab === 'GASTOS' ? 2.5 : 2} />
        <span className="text-[8px] font-bold tracking-wider uppercase">Gastos</span>
      </button>

      <button aria-label="Deudas" onClick={onDeudas} className={itemClass('DEUDAS')}>
        <Receipt size={20} strokeWidth={activeTab === 'DEUDAS' ? 2.5 : 2} />
        <span className="text-[8px] font-bold tracking-wider uppercase">Deudas</span>
      </button>

      <button aria-label="Compartir enlace" onClick={onCompartir} className={`${itemClass('COMPARTIR')} relative`}>
        <Share2 size={20} strokeWidth={activeTab === 'COMPARTIR' ? 2.5 : 2} />
        <span className="text-[8px] font-bold tracking-wider uppercase">Compartir</span>
        {copiedLink && (
          <div className="absolute -top-8 bg-onSurface text-white text-[9px] px-2 py-1.5 rounded-md font-bold whitespace-nowrap animate-in fade-in zoom-in">
            Link Copiado
          </div>
        )}
      </button>

      <button aria-label="Ayuda" onClick={onAyuda} className={itemClass('AYUDA')}>
        <MessageCircle size={20} strokeWidth={activeTab === 'AYUDA' ? 2.5 : 2} />
        <span className="text-[8px] font-bold tracking-wider uppercase">Ayuda</span>
      </button>
    </nav>
  );
}
