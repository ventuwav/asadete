import { useState, useEffect, useRef } from 'react';
import { Users, Flame, CheckCircle } from 'lucide-react';
import Grill from '../components/Grill';
import { Button } from '../components/ui/button';

const BASE = import.meta.env.VITE_API_URL || '';

const slides = [
  {
    icon: (
      <div className="flex flex-col items-center gap-3">
        <div className="bg-white w-24 h-24 rounded-[1.5rem] flex items-center justify-center shadow-sm border border-outlineVariant/40">
          <Grill className="text-primary" fill="currentColor" size={52} />
        </div>
        <span className="font-heading font-bold text-4xl tracking-wide text-primary leading-none">
          asaDeTe
        </span>
      </div>
    ),
    title: 'resuelve las cuentas por vos',
    body: 'Sin hojas de cálculo, sin discusiones. El fuego lo manejás vos, las cuentas las manejamos nosotros.',
  },
  {
    icon: (
      <div className="w-24 h-24 rounded-[1.5rem] bg-primaryLight flex items-center justify-center shadow-inner">
        <Flame size={52} className="text-primary" strokeWidth={1.5} />
      </div>
    ),
    title: 'El DT crea el asaDeTe',
    body: 'El organizador arma el evento y comparte el link o QR con todos los participantes.',
    step: '01',
  },
  {
    icon: (
      <div className="w-24 h-24 rounded-[1.5rem] bg-primaryLight flex items-center justify-center shadow-inner">
        <Users size={52} className="text-primary" strokeWidth={1.5} />
      </div>
    ),
    title: 'Todos se suman y cargan los gastos',
    body: 'Cada participante entra con su link, se identifica y carga lo que puso: carne, vino, carbón... todo.',
    step: '02',
  },
  {
    icon: (
      <div className="w-24 h-24 rounded-[1.5rem] bg-primaryLight flex items-center justify-center shadow-inner">
        <CheckCircle size={52} className="text-primary" strokeWidth={1.5} />
      </div>
    ),
    title: 'Y todos felices',
    body: 'Se asignan los gastos según quién consumió qué, y el sistema calcula quién le debe a quién con las mínimas transferencias posibles.',
    cta: '¡Arranquemos!',
  },
];

const SWIPE_THRESHOLD = 50;
const DRAG_RESISTANCE = 0.4;

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0);
  const [animDir, setAnimDir] = useState<'left' | 'right' | null>(null);
  const [dragX, setDragX] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    fetch(`${BASE}/ping`).catch(() => {});
  }, []);

  const navigate = (dir: 'next' | 'prev') => {
    if (dir === 'next' && current >= slides.length - 1) {
      localStorage.setItem('asadete_onboarding_done', '1');
      onComplete();
      return;
    }
    if (dir === 'prev' && current === 0) return;

    setAnimDir(dir === 'next' ? 'left' : 'right');
    setTimeout(() => {
      setCurrent(c => dir === 'next' ? c + 1 : c - 1);
      setAnimDir(null);
    }, 180);
  };

  const skip = () => {
    localStorage.setItem('asadete_onboarding_done', '1');
    onComplete();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    // Resist dragging right on first slide, left on last slide
    const isAtStart = current === 0 && delta > 0;
    const isAtEnd = current === slides.length - 1 && delta < 0;
    const resistance = isAtStart || isAtEnd ? DRAG_RESISTANCE * 0.3 : DRAG_RESISTANCE;
    setDragX(delta * resistance);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current || touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    isDragging.current = false;
    setDragX(0);
    touchStartX.current = null;

    if (delta < -SWIPE_THRESHOLD) navigate('next');
    else if (delta > SWIPE_THRESHOLD) navigate('prev');
  };

  const slide = slides[current];

  const slideStyle: React.CSSProperties = {
    transform: dragX !== 0
      ? `translateX(${dragX}px)`
      : animDir === 'left'
        ? 'translateX(-40px)'
        : animDir === 'right'
          ? 'translateX(40px)'
          : 'translateX(0)',
    opacity: animDir ? 0 : 1,
    transition: dragX !== 0 ? 'none' : 'transform 180ms ease, opacity 180ms ease',
  };

  return (
    <div
      className="min-h-[100svh] bg-surface flex flex-col items-center justify-between max-w-md mx-auto px-6 py-10 select-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip */}
      <div className="w-full flex justify-end">
        {current < slides.length - 1 && (
          <button onClick={skip} className="text-onSurfaceVariant text-sm font-medium px-2 py-1">
            Omitir
          </button>
        )}
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center" style={slideStyle}>
        <div className="h-40 flex flex-col items-center justify-center mb-6">
          {slide.icon}
        </div>

        <div className="space-y-2 max-w-xs">
          {slide.step && (
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-primary/60 block mb-3">
              PASO {slide.step}
            </span>
          )}
          <h1 className="font-heading font-extrabold text-2xl text-onSurface leading-tight tracking-tight">
            {slide.title}
          </h1>
          <p className="text-onSurfaceVariant text-[14px] leading-relaxed font-medium pt-1">
            {slide.body}
          </p>
        </div>
      </div>

      {/* Bottom: dots + button */}
      <div className="w-full space-y-6">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Ir al slide ${i + 1}`}
              onClick={() => {
                if (i > current) navigate('next');
                else if (i < current) navigate('prev');
              }}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-outlineVariant'
              }`}
            />
          ))}
        </div>

        <Button onClick={() => navigate('next')} className="w-full">
          {slide.cta ?? 'Siguiente'}
        </Button>
      </div>
    </div>
  );
}
