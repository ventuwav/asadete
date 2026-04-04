import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Heart, ShoppingBag, Receipt, Plus, ArrowLeft } from 'lucide-react';
import Grill from '../components/Grill';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import SectionLabel from '../components/SectionLabel';
import { Button } from '../components/ui/button';

interface Props {
  data: any;
}

export default function ClosedDashboard({ data }: Props) {
  const [showSummary, setShowSummary] = useState(true);
  const allItems = data.expenses.flatMap((e: any) => e.items);

  return (
    <PageLayout className="mb-8">
      <header className="flex items-center justify-between px-6 pt-[max(1.5rem,env(safe-area-inset-top,1.5rem))] pb-2">
        <Link to="/" className="w-10 h-10 rounded-full bg-surfaceLow flex items-center justify-center">
          <ArrowLeft size={20} />
        </Link>
      </header>

      <div className="px-6 py-8 flex-1 flex flex-col items-center max-w-md mx-auto w-full text-center space-y-10 animate-in fade-in">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-white shadow-xl shadow-primary/5 flex items-center justify-center mx-auto mb-8 border border-outlineVariant relative z-10">
            <Grill className="text-primary" fill="currentColor" size={56} />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primaryLight/50 rounded-full blur-3xl -z-10" />
          <h1 className="text-[40px] font-heading font-extrabold tracking-tight leading-10 mb-4 text-onSurface">¡Un aplauso<br />para el DT!</h1>
          <p className="text-onSurfaceVariant text-sm font-medium">El ritual ha concluido con éxito.</p>
        </div>

        <Card variant="surface" className="p-6 flex justify-between items-center text-left w-full">
          <div>
            <SectionLabel className="mb-1 block">Estado del encuentro</SectionLabel>
            <h2 className="text-xl font-heading font-bold text-success">Asado Saldado</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-successBg/50 flex items-center justify-center text-success">
            <Check size={24} strokeWidth={3} />
          </div>
        </Card>

        {showSummary && (
          <Card className="p-6 text-left w-full animate-in zoom-in-95 fade-in duration-200">
            <h3 className="text-lg font-heading font-extrabold mb-4 text-onSurface">Balance Final</h3>
            <div className="space-y-4">
              {data.participants.map((p: any) => {
                const participantPaid = data.expenses.filter((e: any) => e.participant_id === p.id).reduce((sum: number, e: any) => sum + e.total_amount, 0);
                const itemsConsumed = allItems.filter((it: any) => it.consumers.length === 0 || it.consumers.some((c: any) => c.id === p.id));
                const participantOwesTotal = itemsConsumed.reduce((sum: number, it: any) => {
                  return sum + (it.consumers.length === 0 ? it.amount / (data.participants.length || 1) : it.amount / it.consumers.length);
                }, 0);

                return (
                  <div key={p.id} className="border-b border-surfaceLow pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2 mt-2">
                      <div>
                        <p className="font-heading font-extrabold text-[15px] text-onSurface">{p.name}</p>
                        <p className="text-[10px] font-bold text-success uppercase tracking-wide mt-0.5">En compras: ${participantPaid.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                      </div>
                      <div className="text-right">
                        <SectionLabel className="mb-0.5 block">Cuota DT</SectionLabel>
                        <p className="font-heading font-bold text-[15px] text-primary">${participantOwesTotal.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                    {itemsConsumed.length > 0 ? (
                      <div className="mt-3 bg-surface rounded-lg p-2.5 space-y-1.5 border border-surfaceLow">
                        {itemsConsumed.map((it: any, idx: number) => {
                          const isFallback = it.consumers.length === 0;
                          const frac = isFallback ? it.amount / (data.participants.length || 1) : it.amount / it.consumers.length;
                          return (
                            <div key={idx} className="flex justify-between items-center text-[11px] text-onSurfaceVariant">
                              <span className="flex items-center gap-1.5 font-medium"><ShoppingBag size={12} className="text-outlineVariant" /> {it.name}</span>
                              <span className="font-bold">${frac.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-outlineVariant italic mt-2">No registró consumos</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Card variant="muted" className="p-6 text-left w-full">
          <h3 className="text-lg font-heading font-extrabold flex items-center gap-2 mb-3 text-onSurface">
            <Heart className="text-primary fill-primary" size={20} /> Mantené vivo el fuego
          </h3>
          <p className="text-xs text-onSurfaceVariant font-medium leading-relaxed mb-6">Si disfrutaste la app, podés dejar una pequeña colaboración para seguir mejorando las herramientas del asador.</p>
          <div className="grid grid-cols-3 gap-3 mb-2">
            <a href="https://mpago.la/1ugH2SK" target="_blank" rel="noopener noreferrer">
              <Card className="p-4 text-center hover:border-primary transition-colors active:scale-95">
                <SectionLabel className="mb-1 block">Chico</SectionLabel>
                <p className="font-heading font-bold text-[15px]">$1000</p>
              </Card>
            </a>
            <a href="https://link.mercadopago.com.ar/asadete" target="_blank" rel="noopener noreferrer">
              <Card className="p-4 text-center border-2 border-primary flex flex-col items-center justify-center hover:bg-primaryLight transition-colors active:scale-95">
                <SectionLabel variant="primary" className="mb-1 block">Tu monto</SectionLabel>
                <p className="font-heading font-bold text-[15px] text-primary">$...</p>
              </Card>
            </a>
            <a href="https://mpago.la/173bLYF" target="_blank" rel="noopener noreferrer">
              <Card className="p-4 text-center hover:border-primary transition-colors active:scale-95">
                <SectionLabel className="mb-1 block">Grande</SectionLabel>
                <p className="font-heading font-bold text-[15px]">$2000</p>
              </Card>
            </a>
          </div>
        </Card>

        <div className="w-full space-y-4 pt-4 pb-12">
          <Link
            to="/"
            className="w-full py-5 bg-primary text-white rounded-card text-sm font-heading font-bold flex justify-center items-center gap-2 shadow-cta hover:bg-primaryDim"
          >
            <Plus size={20} className="bg-white text-primary rounded-full p-0.5" /> Nuevo Asado
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowSummary(!showSummary)}
            className="w-full"
          >
            <Receipt size={18} /> {showSummary ? 'Ocultar Resumen' : 'Ver Resumen Final'}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
