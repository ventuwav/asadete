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
        'min-h-screen bg-surface font-body text-onSurface pb-32 flex flex-col',
        center && 'items-center',
        className
      )}
    >
      {children}
    </div>
  );
}
