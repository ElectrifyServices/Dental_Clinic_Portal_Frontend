import React from 'react';
import { Clock, Calendar, Stethoscope } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface AppointmentTimelineProps {
  appointments: any[];
  doctors: any[];
  statusVariants: Record<string, any>;
}

export const AppointmentTimeline: React.FC<AppointmentTimelineProps> = ({
  appointments,
  doctors,
  statusVariants
}) => {
  return (
    <section>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
          <Clock className="w-4 h-4 text-primary" />
        </div>
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em]">Live Timeline</h4>
        <div className="flex-1 h-px bg-muted ml-2" />
      </div>

      {appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.sort((a, b) => a.time.localeCompare(b.time)).map(apt => {
            const doctor = doctors.find(d => d.id === apt.doctorId);
            return (
              <div key={apt.id} className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-muted">
                <div className="absolute left-[-4px] top-4 w-2 h-2 rounded-full bg-primary ring-4 ring-white" />
                <div className="bg-card border border-border p-5 rounded-[1.5rem] hover:border-primary/20 transition-all group shadow-sm hover:shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-primary tracking-tight">{apt.time}</span>
                      <Badge variant={statusVariants[apt.status] || 'gray'} className="text-[8px] uppercase font-bold tracking-widest px-2">
                        {apt.status}
                      </Badge>
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em] bg-muted px-2 py-0.5 rounded-lg">
                      {apt.duration || 15} MIN SLOT
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary rounded-xl flex items-center justify-center text-primary font-bold text-[10px] shadow-sm">
                        {apt.patientName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-none mb-1">{apt.patientName}</p>
                        <p className="text-[10px] text-muted-foreground font-medium tracking-tight">{apt.patientPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-muted/50 p-2 rounded-xl border border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-card flex items-center justify-center">
                          <Stethoscope className="w-3 h-3 text-muted-foreground/60" />
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight truncate max-w-[100px]">
                          {apt.treatmentType || apt.type}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-tighter">Doctor</p>
                        <p className="text-[11px] font-bold text-primary tracking-tight truncate">{doctor?.name || '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 bg-muted/50 rounded-[2.5rem] border border-dashed border-border">
          <Calendar className="w-12 h-12 text-muted-foreground/10 mx-auto mb-4" />
          <p className="text-muted-foreground/60 font-bold uppercase tracking-widest text-[10px]">No appointments scheduled for today</p>
        </div>
      )}
    </section>
  );
};
