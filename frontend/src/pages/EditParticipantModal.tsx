import { useState, useEffect } from 'react';
import { X, User, Plus, ShoppingCart, CircleOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

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

  // prevent body scroll while modal is open
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
      <div className="relative bg-[#fcf8f7] rounded-t-[2rem] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-300 shadow-2xl">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#d9d2ce]" />
        </div>

        <div className="px-6 pb-10 pt-2 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#b83a0a]">Editando gastos de</p>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#e8ded8] flex items-center justify-center hover:bg-[#d9d2ce]">
              <X size={16} />
            </button>
          </div>

          {/* Identity card */}
          <div className="flex items-center gap-4 bg-white border border-[#e8ded8] rounded-[1.25rem] p-4 shadow-sm">
            <div className="w-11 h-11 rounded-full bg-[#b83a0a]/10 flex items-center justify-center text-[#b83a0a] shrink-0">
              <User size={22} strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-heading font-extrabold text-[#1f1a17] text-lg leading-tight">{participant.name}</p>
              <p className="text-[#a39a95] text-[10px] font-bold tracking-wider uppercase mt-0.5">Participante</p>
            </div>
          </div>

          {/* ¿Compró algo? */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold tracking-widest text-[#5a504b] uppercase ml-1">¿Compró algo?</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setHasExpense(false)} className={`py-5 rounded-[1.25rem] flex flex-col items-center gap-2 font-bold text-[14px] transition-all border-2 ${hasExpense === false ? 'bg-[#fcf8f7] border-[#b83a0a] text-[#b83a0a]' : 'bg-[#e8ded8]/50 border-transparent text-[#7a706b]'}`}>
                <CircleOff size={22} strokeWidth={2.5} /> No, nada
              </button>
              <button type="button" onClick={() => setHasExpense(true)} className={`py-5 rounded-[1.25rem] flex flex-col items-center gap-2 font-bold text-[14px] transition-all border-2 ${hasExpense === true ? 'bg-[#fdf4f1] border-[#b83a0a] text-[#b83a0a]' : 'bg-[#e8ded8]/50 border-transparent text-[#7a706b]'}`}>
                <ShoppingCart size={22} strokeWidth={2.5} /> Sí, gastó
              </button>
            </div>
          </div>

          {/* Expense items */}
          {hasExpense && (
            <div className="bg-white border border-[#e8ded8] rounded-[1.5rem] p-5 space-y-5">
              {items.map((it, idx) => (
                <div key={idx} className="space-y-3 p-4 bg-[#e8ded8]/30 rounded-[1.25rem] relative border border-[#e8ded8]/50">
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)} className="absolute -top-3 -right-3 bg-white text-[#b83a0a] border border-[#e8ded8] rounded-full p-1.5 shadow-sm hover:scale-110 transition-transform">
                      <X size={14} />
                    </button>
                  )}
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-[#5a504b] uppercase mb-1.5 block ml-1">Monto</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a504b] font-bold text-lg">$</span>
                      <input type="number" value={it.amount} onChange={e => { const n = [...items]; n[idx].amount = e.target.value; setItems(n); }} placeholder="0.00" className="w-full bg-[#fcf8f7] border border-[#e8ded8]/80 rounded-[1rem] p-4 pl-9 font-bold text-[#1f1a17] text-lg focus:ring-2 focus:ring-[#b83a0a]/30 outline-none placeholder:text-[#a39a95]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-[#5a504b] uppercase mb-1.5 block ml-1">¿Qué compró?</label>
                    <input value={it.name} onChange={e => { const n = [...items]; n[idx].name = e.target.value; setItems(n); }} placeholder="Ej: 3kg de asado, carbón..." className="w-full bg-[#fcf8f7] border border-[#e8ded8]/80 rounded-[1rem] p-4 font-bold text-[#1f1a17] text-sm focus:ring-2 focus:ring-[#b83a0a]/30 outline-none placeholder:text-[#a39a95] placeholder:font-normal" />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addItem} className="w-full py-3.5 border-2 border-dashed border-[#d9d2ce] rounded-[1.25rem] text-[12px] font-bold text-[#7a706b] flex items-center justify-center gap-2 hover:bg-[#e8ded8]/50 transition-colors">
                <Plus size={16} /> Agregar otro ítem
              </button>
            </div>
          )}

          {/* Alias */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-[#b83a0a] uppercase ml-1">Alias o CBU <span className="text-[#a39a95] font-normal lowercase">(opcional)</span></label>
            <input value={alias} onChange={e => setAlias(e.target.value)} placeholder="Para que le devuelvan la plata" className="w-full bg-[#fcf8f7] border border-[#e8ded8] shadow-inner rounded-[1rem] p-4 font-bold text-[#1f1a17] focus:ring-2 focus:ring-[#b83a0a]/30 outline-none placeholder:text-[#a39a95] placeholder:font-normal" />
          </div>

          {/* Save button */}
          <button onClick={handleSave} disabled={saving || hasExpense === null} className="w-full py-5 bg-[#b83a0a] text-white rounded-[1.25rem] text-[16px] font-heading font-bold shadow-[0_8px_30px_rgba(184,58,10,0.3)] flex justify-center items-center gap-2 hover:bg-[#8a2905] transition-all disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
