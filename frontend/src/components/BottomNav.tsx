import { Wallet, Receipt, Share2 } from 'lucide-react';
import Grill from './Grill';

export type NavTab = 'ASADO' | 'GASTOS' | 'DEUDAS' | 'COMPARTIR';

interface BottomNavProps {
  activeTab: NavTab;
  onAsado?: () => void;
  onGastos?: () => void;
  onDeudas?: () => void;
  onCompartir?: () => void;
  copiedLink?: boolean;
}

export default function BottomNav({
  activeTab,
  onAsado,
  onGastos,
  onDeudas,
  onCompartir,
  copiedLink = false
}: BottomNavProps) {
  const itemClass = (tab: NavTab) =>
    `flex flex-col items-center gap-1 w-20 py-2 rounded-2xl cursor-pointer transition-colors ${
      activeTab === tab
        ? 'bg-[#b83a0a] text-white shadow-md'
        : 'text-[#7a706b] hover:bg-[#e8ded8]'
    }`;

  const iconClass = (tab: NavTab) => (activeTab === tab ? '' : 'text-[#5a504b]');

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#efece9] p-2 px-4 shadow-[0_-10px_40px_rgba(45,51,53,0.03)] flex justify-between items-center z-50 rounded-t-[2rem]">
      <div onClick={onAsado} className={itemClass('ASADO')}>
        <Grill size={22} strokeWidth={activeTab === 'ASADO' ? 2.5 : 2} className={iconClass('ASADO')} />
        <span className="text-[9px] font-bold tracking-wider uppercase">Asado</span>
      </div>

      <div onClick={onGastos} className={itemClass('GASTOS')}>
        <Wallet size={22} strokeWidth={activeTab === 'GASTOS' ? 2.5 : 2} className={iconClass('GASTOS')} />
        <span className="text-[9px] font-bold tracking-wider uppercase">Gastos</span>
      </div>

      <div onClick={onDeudas} className={itemClass('DEUDAS')}>
        <Receipt size={22} strokeWidth={activeTab === 'DEUDAS' ? 2.5 : 2} className={iconClass('DEUDAS')} />
        <span className="text-[9px] font-bold tracking-wider uppercase">Deudas</span>
      </div>

      <div onClick={onCompartir} className={`${itemClass('COMPARTIR')} relative`}>
        <Share2 size={22} strokeWidth={activeTab === 'COMPARTIR' ? 2.5 : 2} className={iconClass('COMPARTIR')} />
        <span className="text-[9px] font-bold tracking-wider uppercase">Compartir</span>
        {copiedLink && (
          <div className="absolute -top-8 bg-black text-white text-[9px] px-2 py-1.5 rounded-md font-bold whitespace-nowrap animate-in fade-in zoom-in">
            Link Copiado
          </div>
        )}
      </div>
    </nav>
  );
}
