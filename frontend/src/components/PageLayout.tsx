import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  /** Centra el contenido horizontalmente (CreateEvent, JoinEvent, ShareEvent) */
  center?: boolean;
  className?: string;
}

export default function PageLayout({ children, center = false, className }: PageLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-[100svh] bg-surface font-body text-onSurface pb-[calc(5rem+env(safe-area-inset-bottom,0px))] flex flex-col',
        center && 'items-center',
        className
      )}
    >
      {children}
    </div>
  );
}
