import React, { useMemo } from 'react';
import { MOCK_REVENUE_30DAYS } from '../../data/mockAnalytics';

interface MiniAreaChartProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}

/** Simple SVG sparkline — no external lib needed */
export function MiniSparkline({ data, color = '#3b82f6', height = 40, className = '' }: MiniAreaChartProps) {
  const w = 100;
  const h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `M ${points[0]} L ${points.join(' L ')} L ${w},${h} L 0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`w-full ${className}`} style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface AreaChartProps {
  data: { date: string; revenue: number; collected?: number }[];
  height?: number;
}

/** Full area chart for Revenue — SVG-based, no library */
export function RevenueAreaChart({ data, height = 200 }: AreaChartProps) {
  const W = 600;
  const H = height;
  const PAD = { t: 10, r: 10, b: 30, l: 50 };
  const cw = W - PAD.l - PAD.r;
  const ch = H - PAD.t - PAD.b;

  const maxVal = Math.max(...data.map(d => d.revenue)) * 1.1;

  const toX = (i: number) => PAD.l + (i / (data.length - 1)) * cw;
  const toY = (v: number) => PAD.t + ch - (v / maxVal) * ch;

  const revPoints = data.map((d, i) => ({ x: toX(i), y: toY(d.revenue) }));
  const colPoints = data.map((d, i) => ({ x: toX(i), y: toY(d.collected ?? d.revenue * 0.8) }));

  const linePath = (pts: { x: number; y: number }[]) =>
    `M ${pts.map(p => `${p.x},${p.y}`).join(' L ')}`;

  const areaPath = (pts: { x: number; y: number }[]) =>
    `M ${pts[0].x},${PAD.t + ch} L ${pts.map(p => `${p.x},${p.y}`).join(' L ')} L ${pts[pts.length - 1].x},${PAD.t + ch} Z`;

  // Tick marks on Y axis
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    y: PAD.t + ch - f * ch,
    label: `₹${Math.round((maxVal * f) / 1000)}k`,
  }));

  // X-axis labels — show every 5th
  const xLabels = data.filter((_, i) => i % 5 === 0).map((d, idx) => ({
    x: toX(idx * 5),
    label: d.date,
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="areaGradRev" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="areaGradCol" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.l} y1={t.y} x2={W - PAD.r} y2={t.y}
            stroke="currentColor" strokeOpacity="0.06" strokeDasharray="4,4" />
          <text x={PAD.l - 6} y={t.y + 4} fontSize="8" fill="currentColor" fillOpacity="0.4"
            textAnchor="end" fontFamily="Inter, sans-serif">{t.label}</text>
        </g>
      ))}

      {/* Area fills */}
      <path d={areaPath(revPoints)} fill="url(#areaGradRev)" />
      <path d={areaPath(colPoints)} fill="url(#areaGradCol)" />

      {/* Lines */}
      <path d={linePath(revPoints)} fill="none" stroke="#3b82f6" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d={linePath(colPoints)} fill="none" stroke="#10b981" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3" />

      {/* X-axis labels */}
      {xLabels.map((l, i) => (
        <text key={i} x={l.x} y={H - 4} fontSize="7.5" fill="currentColor" fillOpacity="0.5"
          textAnchor="middle" fontFamily="Inter, sans-serif">{l.label}</text>
      ))}
    </svg>
  );
}

/** Bar chart for monthly revenue */
export function MonthlyBarChart({ data }: { data: { month: string; revenue: number; target: number }[] }) {
  const W = 600; const H = 180;
  const PAD = { t: 10, r: 10, b: 30, l: 50 };
  const cw = W - PAD.l - PAD.r;
  const ch = H - PAD.t - PAD.b;
  const maxVal = Math.max(...data.map(d => Math.max(d.revenue, d.target))) * 1.1;
  const barW = (cw / data.length) * 0.55;
  const gap   = cw / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const y = PAD.t + ch - f * ch;
        return (
          <g key={i}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y}
              stroke="currentColor" strokeOpacity="0.06" strokeDasharray="4,4" />
            <text x={PAD.l - 6} y={y + 4} fontSize="8" fill="currentColor" fillOpacity="0.4"
              textAnchor="end" fontFamily="Inter,sans-serif">
              ₹{Math.round((maxVal * f) / 1000)}k
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const cx = PAD.l + gap * i + gap / 2;
        const revH = (d.revenue / maxVal) * ch;
        const tgtH = (d.target / maxVal) * ch;
        return (
          <g key={i}>
            {/* Target line */}
            <line
              x1={cx - barW / 2 - 2} x2={cx + barW / 2 + 2}
              y1={PAD.t + ch - tgtH} y2={PAD.t + ch - tgtH}
              stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,2" />
            {/* Revenue bar */}
            <rect
              x={cx - barW / 2} y={PAD.t + ch - revH}
              width={barW} height={revH} rx="3"
              fill={d.revenue >= d.target ? '#10b981' : '#3b82f6'}
              fillOpacity="0.85"
            />
            {/* Month label */}
            <text x={cx} y={H - 6} fontSize="7.5" fill="currentColor" fillOpacity="0.5"
              textAnchor="middle" fontFamily="Inter,sans-serif">{d.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Donut chart — for appointment status / payment mode etc */
interface DonutSlice { label: string; value: number; color: string; }
interface DonutProps { slices: DonutSlice[]; size?: number; label?: string; }
export function DonutChart({ slices, size = 120, label }: DonutProps) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = 42; const cx = 60; const cy = 60;
  let startAngle = -Math.PI / 2;

  const paths = slices.map((s) => {
    const angle = (s.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const endAngle = startAngle + angle;
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = angle > Math.PI ? 1 : 0;
    const d = `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
    startAngle = endAngle;
    return { ...s, d };
  });

  return (
    <svg viewBox="0 0 120 120" className="w-full" style={{ width: size, height: size }}>
      <circle cx={cx} cy={cy} r={r + 2} fill="transparent" />
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.color} opacity={0.88}
          stroke="white" strokeWidth="1.5" />
      ))}
      {/* Center hole */}
      <circle cx={cx} cy={cy} r={26} fill="white" />
      {label && (
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fontWeight="700"
          fill="#374151" fontFamily="Inter,sans-serif">{label}</text>
      )}
    </svg>
  );
}

/** Horizontal bar — for treatment revenue / age groups etc */
export function HorizontalBar({
  label, value, max, color = '#3b82f6', suffix = '', valueLabel,
}: { label: string; value: number; max: number; color?: string; suffix?: string; valueLabel?: React.ReactNode }) {
  const pct = Math.min((value / (max || 1)) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-foreground truncate max-w-[160px]">{label}</span>
        <span className="font-bold" style={{ color }}>
          {valueLabel ?? `${suffix}${value.toLocaleString()}`}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/** Peak hours heatmap cell */
export function HeatmapCell({ count, day, hour }: { count: number; day?: string; hour?: string }) {
  let cellClass = "bg-slate-100/60 border border-slate-200/50 text-slate-400";
  let badgeContent: React.ReactNode = <span className="w-1.5 h-1.5 rounded-full bg-slate-300/80" />;

  if (count >= 10) {
    cellClass = "bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-700 text-white font-extrabold shadow-sm shadow-indigo-300/50 ring-2 ring-violet-400/40";
    badgeContent = count;
  } else if (count >= 7) {
    cellClass = "bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold shadow-2xs";
    badgeContent = count;
  } else if (count >= 4) {
    cellClass = "bg-blue-100/90 border border-blue-200 text-blue-800 font-bold hover:bg-blue-200/90";
    badgeContent = count;
  } else if (count >= 1) {
    cellClass = "bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold hover:bg-emerald-100/80";
    badgeContent = count;
  }

  const isTopRow = day === 'Mon';

  return (
    <div className="relative group flex-1">
      <div
        className={`w-full h-10 sm:h-11 rounded-xl flex items-center justify-center text-xs transition-all duration-200 cursor-pointer hover:scale-105 hover:-translate-y-0.5 hover:z-30 hover:shadow-md ${cellClass}`}
      >
        {badgeContent}
      </div>
      {/* Smart Positioning Tooltip */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 ${
          isTopRow ? 'top-full mt-2' : 'bottom-full mb-2'
        }`}
      >
        {isTopRow && (
          <div className="w-2 h-2 bg-slate-900/95 rotate-45 -mb-1 border-l border-t border-slate-700/80 z-10" />
        )}
        <div className="bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg shadow-xl border border-slate-700/80 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>
            {day && hour ? `${day} @ ${hour}: ` : ''}
            <strong className="text-white font-extrabold">{count}</strong> {count === 1 ? 'appointment' : 'appointments'}
          </span>
        </div>
        {!isTopRow && (
          <div className="w-2 h-2 bg-slate-900/95 rotate-45 -mt-1 border-r border-b border-slate-700/80" />
        )}
      </div>
    </div>
  );
}
