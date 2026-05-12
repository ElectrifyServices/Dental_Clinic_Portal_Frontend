import React from 'react';
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Appointment {
  status: string;
}

interface AppointmentStatsProps {
  appointments: Appointment[];
}

export const AppointmentStats: React.FC<AppointmentStatsProps> = ({ appointments }) => {
  const total = appointments.length;
  const confirmed = appointments.filter(a => ['confirmed', 'scheduled', 'checked-in'].includes(a.status)).length;
  const completed = appointments.filter(a => a.status === 'completed').length;
  const cancelled = appointments.filter(a => ['cancelled', 'no-show'].includes(a.status)).length;

  const STATS = [
    { label: 'Total Volume', val: total, icon: Calendar, color: 'primary', bg: 'bg-secondary' },
    { label: 'Upcoming', val: confirmed, icon: Clock, color: 'blue', bg: 'bg-primary/10' },
    { label: 'Completed', val: completed, icon: CheckCircle, color: 'emerald', bg: 'bg-emerald-50' },
    { label: 'Cancelled', val: cancelled, icon: XCircle, color: 'red', bg: 'bg-destructive/10' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {STATS.map((s, i) => (
        <div key={i} className="bg-card p-6 rounded-[2rem] border border-border shadow-xl shadow-gray-200/20 group hover:border-primary/20 transition-all duration-300">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
              <s.icon className={`w-7 h-7 text-${s.color === 'primary' ? 'primary' : s.color + '-600'}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-1">{s.label}</p>
              <h4 className="text-2xl font-black text-foreground tracking-tight">{s.val}</h4>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
