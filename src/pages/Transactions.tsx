import { useState, useMemo } from 'react';
import { Search, Plus, Filter, ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { TransactionType, Category, ALL_CATEGORIES } from '@/types';
import { formatDate } from '@/lib/data';
import { CategoryIcon } from '@/components/CategoryIcon';
import { TransactionRow } from '@/pages/Dashboard';

interface TransactionsProps {
  onAddTransaction: () => void;
}

export function Transactions({ onAddTransaction }: TransactionsProps) {
  const { transactions, currencySymbol, deleteTransaction } = useSettings();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTransaction(id);
    } catch {
      // error is surfaced via context; row stays visible
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, typeFilter, categoryFilter]);

  const hasFilters = typeFilter !== 'all' || categoryFilter !== 'all' || search.trim() !== '';
  const clearFilters = () => {
    setTypeFilter('all');
    setCategoryFilter('all');
    setSearch('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-prussian-200 text-sm mt-1">
            {filtered.length} {filtered.length === 1 ? 'transaction' : 'transactions'} found
          </p>
        </div>
        <button onClick={onAddTransaction} className="btn-white self-start sm:self-auto">
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-prussian-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by description or category..."
            className="input-field pl-11"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-prussian-300 hover:text-white hover:bg-prussian-700/50"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Type filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-prussian-200 font-medium flex items-center gap-1.5 mr-1">
            <Filter size={14} /> Type:
          </span>
          {(['all', 'income', 'expense'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`chip ${
                typeFilter === t
                  ? 'bg-sky-400/20 text-sky-300 border border-sky-400/40'
                  : 'bg-prussian-700/40 text-prussian-200 border border-prussian-600/30 hover:bg-prussian-700/60'
              }`}
            >
              {t === 'all' && 'All'}
              {t === 'income' && <><ArrowDownLeft size={14} /> Income</>}
              {t === 'expense' && <><ArrowUpRight size={14} /> Expense</>}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-prussian-200 font-medium mr-1">Category:</span>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`chip ${
              categoryFilter === 'all'
                ? 'bg-sky-400/20 text-sky-300 border border-sky-400/40'
                : 'bg-prussian-700/40 text-prussian-200 border border-prussian-600/30 hover:bg-prussian-700/60'
            }`}
          >
            All
          </button>
          {ALL_CATEGORIES.map((c) => (
            <button
              key={c.name}
              onClick={() => setCategoryFilter(c.name)}
              className={`chip ${
                categoryFilter === c.name
                  ? 'text-white border'
                  : 'bg-prussian-700/40 text-prussian-200 border border-prussian-600/30 hover:bg-prussian-700/60'
              }`}
              style={categoryFilter === c.name ? { backgroundColor: `${c.color}22`, borderColor: c.color } : {}}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.name}
            </button>
          ))}
        </div>

        {hasFilters && (
          <button onClick={clearFilters} className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1">
            <X size={14} /> Clear all filters
          </button>
        )}
      </div>

      {/* Transaction list */}
      <div className="card p-5">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="inline-flex h-16 w-16 rounded-2xl bg-prussian-700/40 items-center justify-center mb-4">
              <Search size={28} className="text-prussian-300" />
            </div>
            <p className="text-white font-medium">No transactions found</p>
            <p className="text-sm text-prussian-200 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((t) => (
              <div key={t.id} className="group">
                <TransactionRow t={t} currencySymbol={currencySymbol} onDelete={handleDelete} />
                <div className="ml-14 hidden group-hover:block text-xs text-prussian-300 pb-1">
                  {deletingId === t.id ? 'Deleting...' : formatDate(t.date)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
