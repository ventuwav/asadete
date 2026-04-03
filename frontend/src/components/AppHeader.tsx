import Grill from './Grill';
import { cn } from '@/lib/utils';

interface AppHeaderLargeProps {
  variant: 'large';
}

interface AppHeaderCompactProps {
  variant?: 'compact';
  /** Slot derecho: avatar de usuario, botón de ayuda, etc. */
  right?: React.ReactNode;
  className?: string;
}

type AppHeaderProps = AppHeaderLargeProps | AppHeaderCompactProps;

export default function AppHeader(props: AppHeaderProps) {
  if (props.variant === 'large') {
    return (
      <header className="w-full max-w-md flex flex-col items-center justify-center p-6 pb-2 pt-8">
        <div className="bg-gradient-to-br from-white to-surface w-20 h-20 mb-3 rounded-section flex items-center justify-center shadow-md border border-surfaceHighest/50">
          <Grill className="text-primary" fill="#b83a0a" size={40} />
        </div>
        <span className="font-heading font-extrabold text-3xl tracking-tight text-primary italic leading-none">
          asaDeTe
        </span>
        <span className="text-onSurfaceVariant font-bold text-[10px] tracking-widest uppercase mt-2">
          El DT de tu asado
        </span>
      </header>
    );
  }

  const { right, className } = props as AppHeaderCompactProps;
  return (
    <header
      className={cn(
        'w-full flex items-center justify-between px-6 pt-[max(1.5rem,env(safe-area-inset-top,1.5rem))] pb-2',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Grill className="text-primary" fill="#b83a0a" size={24} />
        <span className="font-heading font-bold text-lg tracking-tight text-primary italic">
          asaDeTe
        </span>
      </div>
      {right}
    </header>
  );
}
