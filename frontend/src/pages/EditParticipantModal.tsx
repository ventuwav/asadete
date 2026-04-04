import { useState, useEffect } from 'react';
import { X, User, Plus, ShoppingCart, CircleOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';

interface Item { name: string; amount: string; }

interface Props {
  shareToken: string;
  adminToken: string;
  participant: { id: string; name: string; alias?: string };
  initialExpenses: { items: { name: string; amount: number }[] }[];
  onClose: () => void;
  onSaved: () => void;
}

export default function EditParticipantModal({ shareToken, adminToken, participant, initialExpenses, onClose, onSaved }: Props) {
  const [alias, setAlias] = useState(participant.alias || '');
  const [hasExpense, setHasExpense] = useState<boolean | null>(initialExpenses.length > 0 ? true : null);
  const [items, setItems] = useState<Item[]>(() => {
    const flat = initialExpenses.flatMap(e => e.items).map(it => ({ name: it.name, amount: it.amount.toString() }));
    return flat.length > 0 ? flat : [{ name: '', amount: '' }];
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const addItem = () => setItems(prev => [...prev, { name: '', amount: '' }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setSaving(true);
    try {
      const expenses = hasExpense
        ? [{
            total_amount: items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0),
            items: items.map(it => ({ name: it.name, amount: parseFloat(it.amount) || 0 }))
          }]
        : [];
      await api.events.editParticipant(shareToken, participant.id, { admin_token: adminToken, alias, expenses });
      toast.success('¡Cambios guardados!');
      onSaved();
    } catch {
      toast.error('No se pudieron guardar los cambios. Intentá de nuevo.');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-surface rounded-t-hero max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-300 shadow-modal">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-outlineVariant" />
        </div>

        <div className="px-6 pb-10 pt-2 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-widest uppercase text-primary">Editando gastos de</p>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-surfaceHighest flex items-center justify-center hover:bg-outlineVariant transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Identity card */}
          <div className="flex items-center gap-4 bg-white border border-outlineVariant/20 rounded-card p-4 shadow-card">
            <div className="w-11 h-11 rounded-full bg-primaryLight flex items-center justify-center text-primary shrink-0">
              <User size={22} strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-heading font-extrabold text-onSurface text-lg leading-tight">{participant.name}</p>
              <p className="text-onSurfaceVariant text-[10px] font-bold tracking-wider uppercase mt-0.5">Participante</p>
            </div>
          </div>

          {/* ¿Compró algo? */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold tracking-widest text-secondary uppercase ml-1">¿Compró algo?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHasExpense(false)}
                className={`py-5 rounded-card flex flex-col items-center gap-2 font-bold text-[14px] transition-all border-2 ${hasExpense === false ? 'bg-surface border-primary text-primary' : 'bg-surfaceHighest/50 border-transparent text-onSurfaceVariant'}`}
              >
                <CircleOff size={22} strokeWidth={2.5} /> No, nada
              </button>
              <button
                type="button"
                onClick={() => setHasExpense(true)}
                className={`py-5 rounded-card flex flex-col items-center gap-2 font-bold text-[14px] transition-all border-2 ${hasExpense === true ? 'bg-primaryLight border-primary text-primary' : 'bg-surfaceHighest/50 border-transparent text-onSurfaceVariant'}`}
              >
                <ShoppingCart size={22} strokeWidth={2.5} /> Sí, gastó
              </button>
            </div>
          </div>

          {/* Expense items */}
          {hasExpense && (
            <div className="bg-white border border-outlineVariant/20 rounded-section p-5 space-y-5">
              {items.map((it, idx) => (
                <div key={idx} className="space-y-3 p-4 bg-surfaceHighest/30 rounded-card relative border border-outlineVariant/20">
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)} className="absolute -top-3 -right-3 bg-white text-primary border border-outlineVariant/20 rounded-full p-1.5 shadow-sm hover:scale-110 transition-transform">
                      <X size={14} />
                    </button>
                  )}
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-secondary uppercase mb-1.5 block ml-1">Monto</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-bold text-lg">$</span>
                      <input
                        type="number"
                        value={it.amount}
                        onChange={e => { const n = [...items]; n[idx].amount = e.target.value; setItems(n); }}
                        placeholder="0.00"
                        className="w-full bg-surface border border-outlineVariant/20 rounded-inner p-4 pl-9 font-bold text-onSurface text-lg focus:ring-2 focus:ring-primary/30 outline-none placeholder:text-onSurfaceVariant"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-secondary uppercase mb-1.5 block ml-1">¿Qué compró?</label>
                    <input
                      value={it.name}
                      onChange={e => { const n = [...items]; n[idx].name = e.target.value; setItems(n); }}
                      placeholder="Ej: 3kg de asado, carbón..."
                      className="w-full bg-surface border border-outlineVariant/20 rounded-inner p-4 font-bold text-onSurface text-sm focus:ring-2 focus:ring-primary/30 outline-none placeholder:text-onSurfaceVariant placeholder:font-normal"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="w-full py-3.5 border-2 border-dashed border-outlineVariant rounded-card text-[12px] font-bold text-onSurfaceVariant flex items-center justify-center gap-2 hover:bg-surfaceHighest/50 transition-colors"
              >
                <Plus size={16} /> Agregar otro ítem
              </button>
            </div>
          )}

          {/* Alias */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-primary uppercase ml-1">
              Alias o CBU <span className="text-onSurfaceVariant font-normal lowercase">(opcional)</span>
            </label>
            <input
              value={alias}
              onChange={e => setAlias(e.target.value)}
              placeholder="Para que le devuelvan la plata"
              className="w-full bg-surface border border-outlineVariant/20 rounded-inner p-4 font-bold text-onSurface focus:ring-2 focus:ring-primary/30 outline-none placeholder:text-onSurfaceVariant placeholder:font-normal"
            />
          </div>

          {/* Save button */}
          <Button
            onClick={handleSave}
            disabled={saving || hasExpense === null}
            className="w-full"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
}
