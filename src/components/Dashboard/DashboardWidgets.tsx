import React from 'react';
import { User, TrendingUp, Clock } from 'lucide-react';
import { MOCK_DOCTORS, MOCK_APPT_STATUS } from '../../data/mockAnalytics';
import { DonutChart } from './Charts';
import { StatusBadge } from '@/components/ui';

function CircleProgress({ value, color = '#3b82f6', size = 48 }: { value: number; color?: string; size?: number }) {
  const r = 18; const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="4" />
      <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4}
        strokeLinecap="round" />
      <text x="24" y="28" textAnchor="middle" fontSize="9" fontWeight="700" fill={color} fontFamily="Inter,sans-serif">
        {value}%
      </text>
    </svg>
  );
}

export function AppointmentStatusWidget({ period = 'today' }: { period?: string }) {
  const total = MOCK_APPT_STATUS.reduce((s, x) => s + x.count, 0);
  const slices = MOCK_APPT_STATUS.map(s => ({ label: s.label, value: s.count, color: s.color }));

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-card h-full">
      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">
        {period === 'today' ? "Today's Status" : period === 'week' ? "This Week's Status" : period === 'month' ? "This Month's Status" : "This Year's Status"}
      </p>
      <div className="flex items-center gap-4">
        <DonutChart slices={slices} size={100} label={`${total}`} />
        <div className="flex-1 space-y-2">
          {MOCK_APPT_STATUS.map(s => (
            <div key={s.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${s.bg}`} />
                <span className="text-[11px] text-muted-foreground font-medium">{s.label}</span>
              </div>
              <span className="text-[11px] font-black text-foreground">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DoctorPerformanceWidget({ period = 'today' }: { period?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-card">
      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" /> Doctor Performance · {period === 'today' ? 'Today' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Year'}
      </p>
      <div className="space-y-4">
        {MOCK_DOCTORS.map((doc) => (
          <div key={doc.id} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${doc.color} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
              {doc.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-foreground truncate">{doc.name}</span>
                <span className="text-[10px] font-black text-emerald-600">₹{(doc.revenue / 1000).toFixed(0)}k</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${doc.utilization}%` }}
                  />
                </div>
                <span className="text-[9px] font-bold text-muted-foreground flex-shrink-0">
                  {doc.utilization}% util
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {doc.appointments} appts
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {doc.completionRate}% completion
                </span>
              </div>
            </div>
            <CircleProgress value={doc.completionRate} size={44} />
          </div>
        ))}
      </div>
    </div>
  );
}
