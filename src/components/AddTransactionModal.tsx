import { useState, useEffect } from 'react';
import { X, Check, ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react';
import { TransactionType, Category, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types';
import { useSettings } from '@/context/SettingsContext';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddTransactionModal({ open, onClose }: AddTransactionModalProps) {
  const { addTransaction, currencySymbol } = useSettings();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (open) {
      setType('expense');
      setAmount('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setError('');
    }
  }, [open]);

  useEffect(() => {
    // Reset category to first of the new type's list
    setCategory((type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)[0].name);
  }, [type]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await addTransaction({
        amount: amt,
        type,
        category,
        date,
        description: description.trim() || `${category} ${type}`,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transaction.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-prussian-950/70 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-prussian-800 border border-prussian-700/60 rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-prussian-700/50 sticky top-0 bg-prussian-800 z-10">
          <h2 className="text-lg font-bold text-white">Add Transaction</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-prussian-200 hover:bg-prussian-700/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-150 ${
                type === 'income'
                  ? 'bg-emerald-400/15 text-emerald-300 border-2 border-emerald-400/50'
                  : 'bg-prussian-900/50 text-prussian-200 border-2 border-prussian-700/40 hover:border-prussian-600'
              }`}
            >
              <ArrowDownLeft size={18} />
              Income
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-150 ${
                type === 'expense'
                  ? 'bg-rose-400/15 text-rose-300 border-2 border-rose-400/50'
                  : 'bg-prussian-900/50 text-prussian-200 border-2 border-prussian-700/40 hover:border-prussian-600'
              }`}
            >
              <ArrowUpRight size={18} />
              Expense
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-prussian-100 mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-prussian-200 font-medium text-lg">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input-field pl-8 text-lg font-semibold"
                autoFocus
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-prussian-100 mb-2">Category</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {categories.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setCategory(c.name)}
                  className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-xs font-medium transition-all duration-150 ${
                    category === c.name
                      ? 'bg-prussian-600/40 border-2 text-white'
                      : 'bg-prussian-900/40 border-2 border-transparent text-prussian-200 hover:bg-prussian-700/40'
                  }`}
                  style={category === c.name ? { borderColor: c.color } : {}}
                >
                  <span
                    className="h-7 w-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${c.color}22`, color: c.color }}
                  >
                    <CategoryDot color={c.color} />
                  </span>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-prussian-100 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-prussian-100 mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for?"
              className="input-field"
            />
          </div>

          {error && (
            <p className="text-sm text-rose-300 bg-rose-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-white flex-1 disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Check size={18} /> Save Transaction</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryDot({ color }: { color: string }) {
  return <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />;
}
