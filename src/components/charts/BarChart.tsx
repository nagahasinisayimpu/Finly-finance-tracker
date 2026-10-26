import { MonthlyData } from '@/lib/data';

interface BarChartProps {
  data: MonthlyData[];
  currencySymbol: string;
  height?: number;
}

export function BarChart({ data, currencySymbol, height = 220 }: BarChartProps) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);
  const barWidth = 28;
  const gap = 16;
  const chartWidth = data.length * (barWidth * 2 + gap) + gap;
  const padding = { top: 20, right: 16, bottom: 32, left: 16 };
  const innerHeight = height - padding.top - padding.bottom;

  return (
    <div className="w-full overflow-x-auto">
      <svg width={chartWidth + padding.left + padding.right} height={height} className="block">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padding.left}
            x2={chartWidth + padding.left}
            y1={padding.top + innerHeight * f}
            y2={padding.top + innerHeight * f}
            stroke="rgba(42, 86, 133, 0.25)"
            strokeWidth={1}
            strokeDasharray={f === 1 ? '0' : '4 4'}
          />
        ))}

        {data.map((d, i) => {
          const incomeH = (d.income / maxVal) * innerHeight;
          const expenseH = (d.expense / maxVal) * innerHeight;
          const x = padding.left + gap + i * (barWidth * 2 + gap);

          return (
            <g key={i} className="transition-all duration-300">
              {/* Income bar */}
              <rect
                x={x}
                y={padding.top + innerHeight - incomeH}
                width={barWidth}
                height={incomeH}
                rx={6}
                fill="#34d399"
                opacity={0.9}
              >
                <title>{`Income: ${currencySymbol}${d.income.toFixed(0)}`}</title>
              </rect>

              {/* Expense bar */}
              <rect
                x={x + barWidth}
                y={padding.top + innerHeight - expenseH}
                width={barWidth}
                height={expenseH}
                rx={6}
                fill="#fb7185"
                opacity={0.9}
              >
                <title>{`Expense: ${currencySymbol}${d.expense.toFixed(0)}`}</title>
              </rect>

              {/* Month label */}
              <text
                x={x + barWidth}
                y={height - 10}
                textAnchor="middle"
                className="fill-prussian-200 text-[11px] font-medium"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
