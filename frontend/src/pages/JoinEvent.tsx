import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, CircleOff, ShoppingCart, Plus, X, User } from 'lucide-react';
import Grill from '../components/Grill';
import BottomNav from '../components/BottomNav';
import PageLayout from '../components/PageLayout';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import SectionLabel from '../components/SectionLabel';
import Input from '../components/Input';
import { Button } from '../components/ui/button';
import { api } from '../lib/api';
import { useCopyLink } from '../hooks/useCopyLink';

export default function JoinEvent() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isEditing = searchParams.get('edit') === 'true';
  const prefill = location.state as any;

  const participantToken = localStorage.getItem(`asadete_${shareToken}`);

  const [name, setName] = useState(prefill?.name || '');
  const [alias, setAlias] = useState(prefill?.alias || '');
  const [hasExpense, setHasExpense] = useState<boolean | null>(
    prefill?.items ? prefill.items.length > 0 : null
  );
  const [items, setItems] = useState<{ name: string; amount: string }[]>(
    prefill?.items?.length > 0 ? prefill.items : [{ name: '', amount: '' }]
  );
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState<any>(null);
  const { copied: copiedNav, copy: copyNav } = useCopyLink();

  useEffect(() => {
    if (isEditing && prefill?.name) return;
    api.events.get(shareToken!).then(setEventData).catch(() => {});
  }, [shareToken, isEditing, prefill?.name]);

  useEffect(() => {
    if (!eventData || !isEditing || !participantToken || prefill?.name) return;
    const me = eventData.participants.find((p: any) => p.participant_token === participantToken);
    if (!me) return;
    setName(me.name);
    if (me.alias) setAlias(me.alias);
    const myExpenses = eventData.expenses.filter((e: any) => e.participant_id === me.id);
    if (myExpenses.length > 0) {
      setHasExpense(true);
      const myItems = myExpenses.flatMap((e: any) => e.items);
      if (myItems.length > 0) {
        setItems(myItems.map((it: any) => ({ name: it.name, amount: it.amount.toString() })));
      }
    } else {
      setHasExpense(false);
    }
  }, [eventData, isEditing, participantToken, prefill?.name]);

  useEffect(() => {
    if (!isEditing && participantToken) navigate(`/e/${shareToken}`);
  }, [isEditing, participantToken, navigate, shareToken]);

  const addItem = () => setItems(prev => [...prev, { name: '', amount: '' }]);
  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      let expensesPayload;
      if (hasExpense && items.length > 0) {
        const validItems = items.filter(i => i.name.trim() !== '' && i.amount !== '' && Number(i.amount) > 0);
        if (validItems.length > 0) {
          expensesPayload = [{
            total_amount: validItems.reduce((acc, it) => acc + Number(it.amount), 0),
            items: validItems.map(it => ({ name: it.name, amount: Number(it.amount) }))
          }];
        }
      }

      const admin_token = localStorage.getItem(`admin_token_${shareToken}`) || undefined;

      const joinData = await api.events.join(shareToken!, {
        name,
        alias: alias || undefined,
        expenses: expensesPayload,
        admin_token,
        participant_token: isEditing ? (participantToken ?? undefined) : undefined
      });

      localStorage.setItem(`asadete_${shareToken}`, joinData.participant_token);
      navigate(`/e/${shareToken}`);
    } catch {
      alert('Error uniendose al asado');
    }
    setLoading(false);
  };

  return (
    <PageLayout center>
      <AppHeader variant="compact" />

      <div className="px-6 py-4 max-w-md mx-auto w-full space-y-8 animate-in fade-in">
        <div className="w-full h-[220px] rounded-hero overflow-hidden relative shadow-md">
          <img src="https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover" alt="Asado" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-[32px] font-heading font-bold text-white leading-tight drop-shadow-md">
              {prefill?.eventName || eventData?.name || 'Cargando asado...'}
            </h1>
            <p className="text-white/80 text-xs mt-2 flex items-center gap-1.5 font-medium">
              <Calendar size={13} /> Hoy, en breve
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-10">
          {isEditing ? (
            <div className="space-y-4 mb-8">
              <SectionLabel className="ml-1">Editando tu cuenta</SectionLabel>
              <Card className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primaryLight flex items-center justify-center text-primary shrink-0">
                    <User size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <SectionLabel className="mb-1 block">Tu Nombre Registrado</SectionLabel>
                    <p className="font-heading font-extrabold text-onSurface text-2xl leading-tight">{name || 'Cargando...'}</p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="space-y-3">
              <SectionLabel className="ml-1">¿Quién sos?</SectionLabel>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Escribí tu nombre..."
              />
            </div>
          )}

          {!isEditing && (
            <div className="space-y-3">
              <SectionLabel className="ml-1">¿Compraste algo?</SectionLabel>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setHasExpense(false)}
                  className={`py-6 rounded-card flex flex-col items-center gap-2 font-bold text-[15px] transition-all border-2 ${hasExpense === false ? 'bg-surface border-primary text-primary shadow-sm' : 'bg-surfaceHighest/50 border-transparent text-onSurfaceVariant'}`}
                >
                  <CircleOff size={24} strokeWidth={2.5} /> No, nada
                </button>
                <button
                  type="button"
                  onClick={() => setHasExpense(true)}
                  className={`py-6 rounded-card flex flex-col items-center gap-2 font-bold text-[15px] transition-all border-2 ${hasExpense === true ? 'bg-primaryLight border-primary text-primary shadow-sm' : 'bg-surfaceHighest/50 border-transparent text-onSurfaceVariant'}`}
                >
                  <ShoppingCart size={24} strokeWidth={2.5} /> Sí, gasté
                </button>
              </div>
            </div>
          )}

          {hasExpense && (
            <Card variant="surface" className="p-6 space-y-6 animate-in slide-in-from-top-4">
              {items.map((it, idx) => (
                <div key={idx} className="space-y-4 p-5 bg-surfaceHighest/30 rounded-card relative border border-outlineVariant/50">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="absolute -top-3 -right-3 bg-white text-primary border border-outlineVariant rounded-full p-1.5 shadow-sm hover:scale-110 transition-transform"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <div>
                    <SectionLabel className="mb-2 block ml-1">Monto gastado</SectionLabel>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-onSurfaceVariant font-bold text-xl">$</span>
                      <Input
                        variant="inner"
                        type="number"
                        required
                        value={it.amount}
                        onChange={e => { const n = [...items]; n[idx].amount = e.target.value; setItems(n); }}
                        placeholder="0.00"
                        className="pl-10 text-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <SectionLabel className="mb-2 block ml-1">¿Qué compraste?</SectionLabel>
                    <Input
                      variant="inner"
                      value={it.name}
                      required
                      onChange={e => { const n = [...items]; n[idx].name = e.target.value; setItems(n); }}
                      placeholder="Ej: 3kg de Asado, Carbón..."
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="w-full py-4 border-2 border-dashed border-outlineVariant rounded-card text-[13px] font-bold text-onSurfaceVariant flex items-center justify-center gap-2 hover:bg-surfaceHighest/50 transition-colors"
              >
                <Plus size={18} /> Agregar otro ítem distinto
              </button>
            </Card>
          )}

          <div className="pt-2">
            <SectionLabel variant="primary" className="mb-2 block ml-1">
              {isEditing ? 'Actualizar tu Alias o CBU' : 'Tu Alias o CBU'}{' '}
              <span className="text-onSurfaceVariant font-normal lowercase">(opcional)</span>
            </SectionLabel>
            <Input
              variant="inner"
              value={alias}
              onChange={e => setAlias(e.target.value)}
              placeholder="Ej: martin.asado.mp"
            />
            <p className="text-outlineVariant text-[10px] mt-2 mb-4 ml-1">Solo necesario para que el resto te pueda transferir.</p>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading || !name.trim() || hasExpense === null}
              className="w-full mb-4"
            >
              {isEditing ? 'Guardar Cambios' : 'Sumarme al Asado'} <Grill size={20} className="text-white" />
            </Button>
            <p className="text-onSurfaceVariant text-[11px] text-center px-4 leading-relaxed font-medium">Al unirte aceptás que el asador es la autoridad máxima.</p>
          </div>
        </form>
      </div>

      <BottomNav
        activeTab="GASTOS"
        onAsado={() => navigate(`/e/${shareToken}`)}
        onGastos={() => navigate(`/e/${shareToken}`)}
        onDeudas={() => navigate(`/e/${shareToken}`)}
        onCompartir={() => copyNav(`${window.location.origin}/e/${shareToken}/join`)}
        copiedLink={copiedNav}
      />
    </PageLayout>
  );
}
