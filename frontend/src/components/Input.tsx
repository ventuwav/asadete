import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * field  → input standalone, fondo surfaceHighest (por defecto)
   * inner  → input dentro de un Card, fondo surface con borde
   */
  variant?: 'field' | 'inner';
}

export default function Input({ variant = 'field', className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full font-bold text-onSurface outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-outlineVariant placeholder:font-normal',
        variant === 'field' && 'bg-surfaceHighest/50 border-transparent rounded-card p-5 text-[15px]',
        variant === 'inner' && 'bg-surface border border-outlineVariant/80 shadow-inner rounded-inner p-4 text-sm',
        className
      )}
      {...props}
    />
  );
}
