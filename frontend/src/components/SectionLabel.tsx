import { cn } from '@/lib/utils';

interface SectionLabelProps {
  children: React.ReactNode;
  /** default → onSurfaceVariant | primary → text-primary */
  variant?: 'default' | 'primary';
  className?: string;
}

export default function SectionLabel({ children, variant = 'default', className }: SectionLabelProps) {
  return (
    <span
      className={cn(
        'text-[10px] font-bold tracking-widest uppercase',
        variant === 'default' && 'text-onSurfaceVariant',
        variant === 'primary' && 'text-primary',
        className
      )}
    >
      {children}
    </span>
  );
}
