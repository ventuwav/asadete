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
    `flex flex-col items-center gap-1 w-14 py-2 rounded-2xl cursor-pointer transition-colors ${
      activeTab === tab
        ? 'bg-[#b83a0a] text-white shadow-md'
        : 'text-[#7a706b] hover:bg-[#e8ded8]'
    }`;

  const iconClass = (tab: NavTab) => (activeTab === tab ? '' : 'text-[#5a504b]');

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#efece9] p-2 px-3 shadow-[0_-10px_40px_rgba(45,51,53,0.03)] flex justify-between items-center z-50 rounded-t-[2rem]">
      <div onClick={onAsado} className={itemClass('ASADO')}>
        <Grill size={20} strokeWidth={activeTab === 'ASADO' ? 2.5 : 2} className={iconClass('ASADO')} />
        <span className="text-[8px] font-bold tracking-wider uppercase">Asado</span>
      </div>

      <div onClick={onGastos} className={itemClass('GASTOS')}>
        <Wallet size={20} strokeWidth={activeTab === 'GASTOS' ? 2.5 : 2} className={iconClass('GASTOS')} />
        <span className="text-[8px] font-bold tracking-wider uppercase">Gastos</span>
      </div>

      <div onClick={onDeudas} className={itemClass('DEUDAS')}>
        <Receipt size={20} strokeWidth={activeTab === 'DEUDAS' ? 2.5 : 2} className={iconClass('DEUDAS')} />
        <span className="text-[8px] font-bold tracking-wider uppercase">Deudas</span>
      </div>

      <div onClick={onCompartir} className={`${itemClass('COMPARTIR')} relative`}>
        <Share2 size={20} strokeWidth={activeTab === 'COMPARTIR' ? 2.5 : 2} className={iconClass('COMPARTIR')} />
        <span className="text-[8px] font-bold tracking-wider uppercase">Compartir</span>
        {copiedLink && (
          <div className="absolute -top-8 bg-black text-white text-[9px] px-2 py-1.5 rounded-md font-bold whitespace-nowrap animate-in fade-in zoom-in">
            Link Copiado
          </div>
        )}
      </div>

      <div onClick={onAyuda} className={itemClass('AYUDA')}>
        <MessageCircle size={20} strokeWidth={activeTab === 'AYUDA' ? 2.5 : 2} className={iconClass('AYUDA')} />
        <span className="text-[8px] font-bold tracking-wider uppercase">Ayuda</span>
      </div>
    </nav>
  );
}
