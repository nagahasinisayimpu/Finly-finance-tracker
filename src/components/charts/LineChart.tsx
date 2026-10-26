import { MonthlyData } from '@/lib/data';

interface LineChartProps {
  data: MonthlyData[];
  currencySymbol: string;
  height?: number;
}

export function LineChart({ data, height = 240 }: LineChartProps) {
  const width = 600;
  const padding = { top: 20, right: 20, bottom: 32, left: 20 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = (key: 'income' | 'expense') =>
    data.map((d, i) => ({
      x: padding.left + i * stepX,
      y: padding.top + innerH - (d[key] / maxVal) * innerH,
    }));

  const incomePts = points('income');
  const expensePts = points('expense');

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const toAreaPath = (pts: { x: number; y: number }[]) =>
    `${toPath(pts)} L ${pts[pts.length - 1]?.x ?? 0} ${padding.top + innerH} L ${pts[0]?.x ?? 0} ${padding.top + innerH} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} className="block">
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb7185" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + innerH * f}
            y2={padding.top + innerH * f}
            stroke="rgba(42, 86, 133, 0.2)"
            strokeWidth={1}
            strokeDasharray={f === 1 ? '0' : '4 4'}
          />
        ))}

        {/* Expense area + line */}
        {expensePts.length > 1 && (
          <>
            <path d={toAreaPath(expensePts)} fill="url(#expenseGrad)" />
            <path d={toPath(expensePts)} fill="none" stroke="#fb7185" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            {expensePts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#fb7185" stroke="#0f2036" strokeWidth={2} />
            ))}
          </>
        )}

        {/* Income area + line */}
        {incomePts.length > 1 && (
          <>
            <path d={toAreaPath(incomePts)} fill="url(#incomeGrad)" />
            <path d={toPath(incomePts)} fill="none" stroke="#34d399" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            {incomePts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#34d399" stroke="#0f2036" strokeWidth={2} />
            ))}
          </>
        )}

        {/* Labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={padding.left + i * stepX}
            y={height - 10}
            textAnchor="middle"
            className="fill-prussian-200 text-[11px] font-medium"
          >
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
