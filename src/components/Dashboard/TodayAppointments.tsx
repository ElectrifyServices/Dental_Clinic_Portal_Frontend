import React from 'react';
import { Phone, Calendar } from 'lucide-react';
import { StatusBadge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface TodayAppointmentsProps {
  appointments?: any[];
}

type StatusVariant = 'green' | 'blue' | 'indigo' | 'gray' | 'red';

const STATUS_META: Record<string, { label: string; variant: StatusVariant }> = {
  completed:    { label: 'Completed',   variant: 'green' },
  'in-progress':{ label: 'In Progress', variant: 'blue' },
  confirmed:    { label: 'Confirmed',   variant: 'indigo' },
  scheduled:    { label: 'Scheduled',   variant: 'gray' },
  cancelled:    { label: 'Cancelled',   variant: 'red' },
  'no-show':    { label: 'No Show',     variant: 'red' },
};

export function TodayAppointments({ appointments = [] }: TodayAppointmentsProps) {
  const today = new Date().toDateString();
  const todayAppts = appointments
    .filter(a => new Date(a.date).toDateString() === today)
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 8);

  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-sm font-bold text-foreground">Today's Appointments</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{todayAppts.length} scheduled today</p>
        </div>
        <Calendar className="w-4 h-4 text-muted-foreground" />
      </div>
      {todayAppts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 ring-8 ring-primary/5">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-[15px] font-bold text-foreground mb-1 uppercase tracking-tight">Your schedule is clear</h3>
          <p className="text-xs text-muted-foreground text-center max-w-[220px] leading-relaxed">
            There are no appointments scheduled for today.
          </p>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Clinic Optimized
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {todayAppts.map((appt, i) => {
            const sm = STATUS_META[appt.status] ?? STATUS_META.scheduled;
            return (
              <div key={appt.id || i} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors">
                <div className="w-14 flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{appt.time}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground truncate">{appt.patientName || appt.patient}</span>
                    <StatusBadge variant={sm.variant}>{sm.label}</StatusBadge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground truncate">{appt.treatmentType || appt.type}</span>
                    {(appt.patientPhone || appt.phone) && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                        <Phone className="w-2.5 h-2.5" />{appt.patientPhone || appt.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground flex-shrink-0">{appt.duration || 15}m</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
