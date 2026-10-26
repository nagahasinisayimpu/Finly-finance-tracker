import { Transaction, MONTH_LABELS, Category } from '@/types';

export function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

export function getMonthLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${MONTH_LABELS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
}

export function formatMoney(amount: number, symbol: string): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: abs < 100 ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${sign}${symbol}${formatted}`;
}

export function formatMoneyWithSign(amount: number, symbol: string, type: 'income' | 'expense'): string {
  const sign = type === 'income' ? '+' : '-';
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: abs < 100 ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${sign}${symbol}${formatted}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function isThisMonth(dateStr: string): boolean {
  const now = new Date();
  const d = new Date(dateStr + 'T00:00:00');
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function getMonthlyTotals(transactions: Transaction[]): { income: number; expense: number } {
  return transactions.reduce(
    (acc, t) => {
      if (isThisMonth(t.date)) {
        if (t.type === 'income') acc.income += t.amount;
        else acc.expense += t.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );
}

export function getTotalBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => (t.type === 'income' ? sum + t.amount : sum - t.amount), 0);
}

export function getCategoryBreakdown(transactions: Transaction[], type: 'income' | 'expense'): { category: Category; amount: number }[] {
  const map = new Map<Category, number>();
  for (const t of transactions) {
    if (t.type !== type) continue;
    if (!isThisMonth(t.date)) continue;
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  }
  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export interface MonthlyData {
  label: string;
  income: number;
  expense: number;
}

export function getMonthlySeries(transactions: Transaction[], months: number): MonthlyData[] {
  const now = new Date();
  const result: MonthlyData[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = MONTH_LABELS[d.getMonth()];

    const monthTx = transactions.filter((t) => getMonthKey(t.date) === monthKey);
    const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    result.push({ label, income, expense });
  }

  return result;
}

export function getRecentTransactions(transactions: Transaction[], n: number): Transaction[] {
  return [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, n);
}
