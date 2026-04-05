import { Card } from './Card';

/* ── Bar Chart ── */
interface BarChartProps {
  title: string;
  data: { label: string; value: number; color?: string }[];
  className?: string;
}

export function BarChart({ title, data, className = '' }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card className={className} padding="none">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-3 px-6 py-4">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium text-gray-900">{item.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${item.color ?? 'bg-primary-600'}`}
                style={{ width: `${(item.value / max) * 100}%` }}
                role="meter"
                aria-valuenow={item.value}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-label={item.label}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Donut Chart ── */
interface DonutChartProps {
  title: string;
  data: { label: string; value: number; color: string }[];
  className?: string;
}

export function DonutChart({ title, data, className = '' }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cumulativePercent = 0;

  const segments = data.map((item) => {
    const percent = (item.value / total) * 100;
    const offset = cumulativePercent;
    cumulativePercent += percent;
    return { ...item, percent, offset };
  });

  return (
    <Card className={className} padding="none">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="flex items-center gap-6 px-6 py-4">
        {/* SVG donut */}
        <svg viewBox="0 0 36 36" className="h-28 w-28 shrink-0" aria-hidden="true">
          {segments.map((seg) => (
            <circle
              key={seg.label}
              cx="18"
              cy="18"
              r="15.915"
              fill="none"
              stroke={seg.color}
              strokeWidth="3.5"
              strokeDasharray={`${seg.percent} ${100 - seg.percent}`}
              strokeDashoffset={`${-seg.offset}`}
              className="transition-all"
            />
          ))}
          <text
            x="18"
            y="18"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-gray-900 text-[6px] font-bold"
          >
            {total}
          </text>
        </svg>

        {/* Legend */}
        <div className="space-y-2">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2 text-xs">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-gray-600">{seg.label}</span>
              <span className="font-semibold text-gray-900">{seg.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ── Stat Card ── */
interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  className?: string;
}

export function StatCard({ label, value, change, className = '' }: StatCardProps) {
  return (
    <Card padding="sm" className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {change !== undefined && (
        <p
          className={`mt-1 text-xs font-medium ${
            change >= 0 ? 'text-success-600' : 'text-danger-600'
          }`}
        >
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% vs last month
        </p>
      )}
    </Card>
  );
}

/* ── Trend Line (simple sparkline) ── */
interface TrendLineProps {
  title: string;
  data: { label: string; value: number }[];
  className?: string;
}

export function TrendLine({ title, data, className = '' }: TrendLineProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;
  const width = 300;
  const height = 80;
  const padding = 4;

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (width - 2 * padding);
    const y = height - padding - ((d.value - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  });

  return (
    <Card className={className} padding="none">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="px-6 py-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-20 w-full"
          aria-label={`${title} trend chart`}
          role="img"
        >
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points.join(' ')}
            className="text-primary-600"
          />
          {data.map((d, i) => {
            const x =
              padding + (i / Math.max(data.length - 1, 1)) * (width - 2 * padding);
            const y =
              height - padding - ((d.value - min) / range) * (height - 2 * padding);
            return <circle key={i} cx={x} cy={y} r="3" className="fill-primary-600" />;
          })}
        </svg>
        <div className="mt-2 flex justify-between text-[10px] text-gray-400">
          {data.length > 0 && <span>{data[0].label}</span>}
          {data.length > 1 && <span>{data[data.length - 1].label}</span>}
        </div>
      </div>
    </Card>
  );
}
