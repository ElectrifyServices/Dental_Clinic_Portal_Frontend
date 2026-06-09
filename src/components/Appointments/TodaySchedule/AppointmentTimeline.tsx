import React from "react";
import { Clock, Calendar, Stethoscope } from "lucide-react";
import { ContentCard, Badge } from "@/components/ui";
interface AppointmentTimelineProps {
  appointments: any[];
  doctors: any[];
  statusVariants: Record<string, any>;
}

export const AppointmentTimeline: React.FC<AppointmentTimelineProps> = ({
  appointments,
  doctors,
  statusVariants,
}) => {
  return (
    <section>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center ring-8 ring-primary/5">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="text-xs font-black text-foreground uppercase tracking-[0.2em] leading-none">
            Live Timeline
          </h4>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1.5">
            Real-time schedule update
          </p>
        </div>
      </div>

      {appointments.length > 0 ? (
        <div className="space-y-6">
          {appointments
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((apt) => {
              const doctor = doctors.find((d) => d.id === apt.doctorId);
              return (
                <div
                  key={apt.id}
                  className="relative pl-10 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-muted before:rounded-full"
                >
                  <div className="absolute left-[-6px] top-6 w-4 h-4 rounded-full bg-primary ring-8 ring-white shadow-lg" />

                  <ContentCard
                    className="rounded-3xl hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 border-border/50"
                    bodyClassName="p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-primary tracking-tight">
                          {apt.time}
                        </span>
                        <Badge
                          variant={statusVariants[apt.status] || "gray"}
                          className="text-[9px] font-black uppercase px-2.5 h-5"
                        >
                          {apt.status}
                        </Badge>
                      </div>
                      <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest bg-muted/50 px-3 py-1 rounded-full border border-border/50">
                        {apt.duration || 15} MIN SLOT
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-sm shadow-sm ring-4 ring-primary/5">
                          {apt.patientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground leading-none mb-1.5">
                            {apt.patientName}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-bold font-mono tracking-tighter opacity-60">
                            {apt.patientPhone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-muted/30 p-3 rounded-2xl border border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-card flex items-center justify-center shadow-sm">
                            <Stethoscope className="w-4 h-4 text-primary/60" />
                          </div>
                          <span className="text-[11px] font-black text-foreground uppercase tracking-tight truncate max-w-[120px]">
                            {apt.treatmentType || apt.type}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest mb-0.5">
                            Doctor
                          </p>
                          <p className="text-xs font-black text-primary tracking-tight truncate">
                            {doctor?.name || "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </ContentCard>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="text-center py-24 bg-muted/20 rounded-[3rem] border-2 border-dashed border-border/50">
          <Calendar className="w-16 h-16 text-muted-foreground/10 mx-auto mb-6" />
          <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">
            No appointments scheduled
          </h3>
          <p className="text-xs text-muted-foreground/60 mt-2 font-medium">
            Timeline will populate once appointments are added.
          </p>
        </div>
      )}
    </section>
  );
};
