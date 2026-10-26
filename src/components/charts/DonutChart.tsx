import { CATEGORY_MAP, Category } from '@/types';

interface DonutChartProps {
  data: { category: Category; amount: number }[];
  total: number;
  size?: number;
}

export function DonutChart({ data, total, size = 200 }: DonutChartProps) {
  const radius = size / 2;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * (radius - strokeWidth / 2);

  let offset = 0;
  const segments = data.map((d) => {
    const fraction = total > 0 ? d.amount / total : 0;
    const dash = fraction * circumference;
    const seg = {
      color: CATEGORY_MAP[d.category]?.color ?? '#94a3b8',
      dash,
      offset: -offset,
      label: d.category,
      amount: d.amount,
      pct: fraction * 100,
    };
    offset += dash;
    return seg;
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            fill="none"
            stroke="rgba(42, 86, 133, 0.2)"
            strokeWidth={strokeWidth}
          />
          {total > 0 &&
            segments.map((s, i) => (
              <circle
                key={i}
                cx={radius}
                cy={radius}
                r={radius - strokeWidth / 2}
                fill="none"
                stroke={s.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${s.dash} ${circumference - s.dash}`}
                strokeDashoffset={s.offset}
                strokeLinecap="butt"
                className="transition-all duration-500"
              >
                <title>{`${s.label}: ${s.pct.toFixed(1)}%`}</title>
              </circle>
            ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{data.length}</span>
          <span className="text-xs text-prussian-200">categories</span>
        </div>
      </div>

      <div className="flex-1 space-y-2 w-full">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-prussian-100 font-medium flex-1 truncate">{s.label}</span>
            <span className="text-prussian-200 tabular-nums">{s.pct.toFixed(0)}%</span>
          </div>
        ))}
        {segments.length === 0 && (
          <p className="text-sm text-prussian-200">No data for this period.</p>
        )}
      </div>
    </div>
  );
}
