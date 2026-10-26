import { TrendingUp, TrendingDown, Wallet, ArrowDownLeft, ArrowUpRight, ChevronRight, Trash2 } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { Transaction } from '@/types';
import {
  getMonthlyTotals, getTotalBalance, getCategoryBreakdown,
  getMonthlySeries, getRecentTransactions, formatMoney, formatMoneyWithSign, formatShortDate,
} from '@/lib/data';
import { BarChart } from '@/components/charts/BarChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { CategoryIcon } from '@/components/CategoryIcon';

interface DashboardProps {
  onNavigate: (p: 'transactions') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { transactions, currencySymbol } = useSettings();

  const totals = getMonthlyTotals(transactions);
  const balance = getTotalBalance(transactions);
  const expenseBreakdown = getCategoryBreakdown(transactions, 'expense');
  const expenseTotal = expenseBreakdown.reduce((s, c) => s + c.amount, 0);
  const monthlySeries = getMonthlySeries(transactions, 6);
  const recent = getRecentTransactions(transactions, 6);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-prussian-200 text-sm mt-1">Welcome back! Here's your financial overview.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total balance */}
        <div className="card p-5 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-sky-400/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-prussian-200 text-sm font-medium">
              <span className="h-8 w-8 rounded-xl bg-sky-400/15 flex items-center justify-center">
                <Wallet size={16} className="text-sky-400" />
              </span>
              Total Balance
            </div>
            <p className="text-3xl font-bold text-white mt-3 tabular-nums">{formatMoney(balance, currencySymbol)}</p>
            <p className="text-xs text-prussian-300 mt-1">All-time net savings</p>
          </div>
        </div>

        {/* Total income */}
        <div className="card p-5 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-prussian-200 text-sm font-medium">
              <span className="h-8 w-8 rounded-xl bg-emerald-400/15 flex items-center justify-center">
                <ArrowDownLeft size={16} className="text-emerald-400" />
              </span>
              Income (This Month)
            </div>
            <p className="text-3xl font-bold text-white mt-3 tabular-nums">{formatMoney(totals.income, currencySymbol)}</p>
            <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
              <TrendingUp size={14} />
              <span>+{((totals.income / (totals.income + totals.expense || 1)) * 100).toFixed(0)}% of activity</span>
            </div>
          </div>
        </div>

        {/* Total expenses */}
        <div className="card p-5 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-rose-400/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-prussian-200 text-sm font-medium">
              <span className="h-8 w-8 rounded-xl bg-rose-400/15 flex items-center justify-center">
                <ArrowUpRight size={16} className="text-rose-400" />
              </span>
              Expenses (This Month)
            </div>
            <p className="text-3xl font-bold text-white mt-3 tabular-nums">{formatMoney(totals.expense, currencySymbol)}</p>
            <div className="flex items-center gap-1 text-xs text-rose-400 mt-1">
              <TrendingDown size={14} />
              <span>{((totals.expense / (totals.income || 1)) * 100).toFixed(0)}% of income spent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly spending chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Monthly Spending</h2>
              <p className="text-xs text-prussian-200">Income vs expenses over 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-prussian-100">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-prussian-100">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Expense
              </span>
            </div>
          </div>
          <BarChart data={monthlySeries} currencySymbol={currencySymbol} />
        </div>

        {/* Category breakdown */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-white mb-1">Expense Breakdown</h2>
          <p className="text-xs text-prussian-200 mb-5">By category, this month</p>
          <DonutChart data={expenseBreakdown} total={expenseTotal} size={160} />
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Recent Transactions</h2>
          <button
            onClick={() => onNavigate('transactions')}
            className="flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
          >
            View all <ChevronRight size={16} />
          </button>
        </div>
        <div className="space-y-1">
          {recent.map((t) => (
            <TransactionRow key={t.id} t={t} currencySymbol={currencySymbol} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TransactionRow({ t, currencySymbol, onDelete }: { t: Transaction; currencySymbol: string; onDelete?: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-prussian-700/30 transition-colors group">
      <CategoryIcon category={t.category} size={20} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{t.description}</p>
        <p className="text-xs text-prussian-200">
          {t.category} · {formatShortDate(t.date)}
        </p>
      </div>
      <span
        className={`text-sm font-semibold tabular-nums ${
          t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
        }`}
      >
        {formatMoneyWithSign(t.amount, currencySymbol, t.type)}
      </span>
      {onDelete && (
        <button
          onClick={() => onDelete(t.id)}
          className="p-1.5 rounded-lg text-prussian-300 hover:text-rose-400 hover:bg-rose-400/10 transition-all opacity-0 group-hover:opacity-100"
          title="Delete transaction"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
