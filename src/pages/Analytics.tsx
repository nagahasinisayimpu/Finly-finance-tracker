import { useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import {
  getMonthlySeries, getCategoryBreakdown, formatMoney,
} from '@/lib/data';
import { CATEGORY_MAP } from '@/types';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { DonutChart } from '@/components/charts/DonutChart';

export function Analytics() {
  const { transactions, currencySymbol } = useSettings();

  const monthlySeries = getMonthlySeries(transactions, 6);
  const expenseBreakdown = getCategoryBreakdown(transactions, 'expense');
  const expenseTotal = expenseBreakdown.reduce((s, c) => s + c.amount, 0);
  const incomeBreakdown = getCategoryBreakdown(transactions, 'income');
  const incomeTotal = incomeBreakdown.reduce((s, c) => s + c.amount, 0);

  const totalIncome6mo = monthlySeries.reduce((s, m) => s + m.income, 0);
  const totalExpense6mo = monthlySeries.reduce((s, m) => s + m.expense, 0);
  const savingsRate = totalIncome6mo > 0 ? ((totalIncome6mo - totalExpense6mo) / totalIncome6mo) * 100 : 0;
  const avgExpense = totalExpense6mo / monthlySeries.length;

  // Top spending categories (all time)
  const topCategories = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== 'expense') continue;
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.slice(0, 6).map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      pct: (amt / max) * 100,
    }));
  }, [transactions]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-prussian-200 text-sm mt-1">Deep dive into your financial patterns.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={TrendingUp}
          label="6-Month Income"
          value={formatMoney(totalIncome6mo, currencySymbol)}
          color="emerald"
        />
        <SummaryCard
          icon={TrendingDown}
          label="6-Month Expenses"
          value={formatMoney(totalExpense6mo, currencySymbol)}
          color="rose"
        />
        <SummaryCard
          icon={Activity}
          label="Savings Rate"
          value={`${savingsRate.toFixed(0)}%`}
          color="sky"
        />
        <SummaryCard
          icon={BarChart3}
          label="Avg Monthly Spend"
          value={formatMoney(avgExpense, currencySymbol)}
          color="gold"
        />
      </div>

      {/* Monthly income vs expenses */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Monthly Income vs Expenses</h2>
            <p className="text-xs text-prussian-200">Last 6 months comparison</p>
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
        <BarChart data={monthlySeries} currencySymbol={currencySymbol} height={260} />
      </div>

      {/* Spending trends line chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Spending Trends</h2>
            <p className="text-xs text-prussian-200">Income and expense flow over time</p>
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
        <LineChart data={monthlySeries} currencySymbol={currencySymbol} height={260} />
      </div>

      {/* Category-wise spending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expense donut */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <PieChart size={18} className="text-rose-400" />
            <h2 className="text-base font-semibold text-white">Expense by Category</h2>
          </div>
          <p className="text-xs text-prussian-200 mb-5">This month</p>
          <DonutChart data={expenseBreakdown} total={expenseTotal} size={180} />
        </div>

        {/* Income donut */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <PieChart size={18} className="text-emerald-400" />
            <h2 className="text-base font-semibold text-white">Income by Category</h2>
          </div>
          <p className="text-xs text-prussian-200 mb-5">This month</p>
          <DonutChart data={incomeBreakdown} total={incomeTotal} size={180} />
        </div>
      </div>

      {/* Top spending categories bar list */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-white mb-1">Top Spending Categories</h2>
        <p className="text-xs text-prussian-200 mb-5">All-time ranking</p>
        <div className="space-y-4">
          {topCategories.map((c) => {
            const meta = CATEGORY_MAP[c.category as keyof typeof CATEGORY_MAP];
            return (
              <div key={c.category} className="flex items-center gap-3">
                <span className="text-sm font-medium text-prussian-100 w-24 shrink-0">{c.category}</span>
                <div className="flex-1 h-7 rounded-lg bg-prussian-900/50 overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${c.pct}%`, backgroundColor: `${meta?.color ?? '#94a3b8'}33` }}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta?.color }} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-white tabular-nums w-20 text-right">
                  {formatMoney(c.amount, currencySymbol)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  color: 'emerald' | 'rose' | 'sky' | 'gold';
}) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-400/15', text: 'text-emerald-400' },
    rose: { bg: 'bg-rose-400/15', text: 'text-rose-400' },
    sky: { bg: 'bg-sky-400/15', text: 'text-sky-400' },
    gold: { bg: 'bg-amber-400/15', text: 'text-amber-400' },
  };
  const c = colorMap[color];

  return (
    <div className="card p-4">
      <div className={`h-9 w-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
        <Icon size={18} className={c.text} />
      </div>
      <p className="text-xs text-prussian-200 font-medium">{label}</p>
      <p className="text-xl font-bold text-white mt-1 tabular-nums">{value}</p>
    </div>
  );
}
