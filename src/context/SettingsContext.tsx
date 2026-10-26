import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CURRENCIES, Transaction } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export type ThemeMode = 'dark' | 'light';

interface SettingsContextValue {
  currencySymbol: string;
  currencyCode: string;
  setCurrency: (code: string) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('finly-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

function mapRow(row: { id: string; amount: number; type: string; category: string; description: string; date: string }): Transaction {
  return {
    id: row.id,
    amount: Number(row.amount),
    type: row.type as 'income' | 'expense',
    category: row.category as Transaction['category'],
    description: row.description,
    date: row.date,
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currencySymbol = CURRENCIES.find((c) => c.code === currencyCode)?.symbol ?? '$';

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('finly-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (cancelled) return;

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      setTransactions(data ? data.map(mapRow) : []);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  const setCurrency = useCallback((code: string) => setCurrencyCode(code), []);
  const setThemeMode = useCallback((t: ThemeMode) => setTheme(t), []);

  const addTransaction = useCallback(async (t: Omit<Transaction, 'id'>) => {
    const { data, error: err } = await supabase
      .from('transactions')
      .insert({
        amount: t.amount,
        type: t.type,
        category: t.category,
        description: t.description,
        date: t.date,
      })
      .select()
      .single();

    if (err) throw new Error(err.message);

    const mapped = mapRow(data as unknown as Parameters<typeof mapRow>[0]);
    setTransactions((prev) => [mapped, ...prev]);
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    const { error: err } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (err) throw new Error(err.message);

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        currencySymbol,
        currencyCode,
        setCurrency,
        theme,
        setTheme: setThemeMode,
        transactions,
        loading,
        error,
        addTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
