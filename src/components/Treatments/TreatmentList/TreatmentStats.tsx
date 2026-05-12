import React from 'react';
import { Users, Clock, CheckCircle, Calendar } from 'lucide-react';

interface TreatmentStatsProps {
  totals: {
    all: number;
    active: number;
    completed: number;
    planned: number;
    revenue: number;
  };
}

export function TreatmentStats({ totals }: TreatmentStatsProps) {
  const stats = [
    { label: 'Total Plans', value: totals.all, icon: <Users className="w-5 h-5" />, color: 'text-foreground', bg: 'bg-muted', border: 'border-border' },
    { label: 'In Progress', value: totals.active, icon: <Clock className="w-5 h-5" />, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
    { label: 'Completed', value: totals.completed, icon: <CheckCircle className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
    { label: 'Planned', value: totals.planned, icon: <Calendar className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className={`bg-card p-4 rounded-3xl border border-border shadow-sm transition-all hover:shadow-md group`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
              {s.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground leading-none">{s.value}</div>
              <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
