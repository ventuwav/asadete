import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  /**
   * default  → bg-white, borde sutil, shadow-sm (cards de contenido)
   * surface  → bg-surface, borde outlineVariant, shadow-sm (secciones internas)
   * muted    → bg-surfaceHighest/50, sin borde, rounded-section (contenedores de sección)
   * dark     → bg-onSurface, sin borde (panel DT)
   */
  variant?: 'default' | 'surface' | 'muted' | 'dark';
  className?: string;
}

const variants: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-white rounded-card shadow-sm border border-outlineVariant/50',
  surface: 'bg-surface border border-outlineVariant rounded-section shadow-sm',
  muted:   'bg-surfaceHighest/50 rounded-section',
  dark:    'bg-onSurface rounded-card',
};

export default function Card({ children, variant = 'default', className }: CardProps) {
  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
}
