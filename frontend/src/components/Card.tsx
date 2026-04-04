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
  default: 'bg-surface rounded-card shadow-card border border-outlineVariant/20',
  surface: 'bg-surfaceLow border border-outlineVariant/20 rounded-section shadow-modal',
  muted:   'bg-surfaceHighest/50 rounded-section',
  dark:    'bg-surfaceDark rounded-hero',
};

export default function Card({ children, variant = 'default', className }: CardProps) {
  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
}
