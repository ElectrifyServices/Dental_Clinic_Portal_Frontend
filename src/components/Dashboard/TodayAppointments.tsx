import { Phone, Calendar } from "lucide-react";
import { ContentCard, Badge } from "@/components/ui";
import { Appointment } from "@/types";

const STATUS_META: Record<string, { label: string; variant: any }> = {
  scheduled: { label: "Scheduled", variant: "gray" },
  confirmed: { label: "Confirmed", variant: "indigo" },
  "checked-in": { label: "Checked In", variant: "purple" },
  "in-progress": { label: "In Progress", variant: "blue" },
  completed: { label: "Completed", variant: "green" },
  cancelled: { label: "Cancelled", variant: "red" },
  "no-show": { label: "No Show", variant: "amber" },
};

export function TodayAppointments({
  appointments = [],
  period = 'today',
}: {
  appointments: Appointment[];
  period?: string;
}) {
  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  // A real app would filter based on 'period'. For mock UI purposes, we'll assume the parent passes the correct appointments,
  // or we just show them all if it's not 'today'. 
  const filteredAppts = period === 'today' 
    ? appointments.filter((a) => {
        const aDateStr = typeof a.date === 'string' && a.date.includes('T') ? a.date.split('T')[0] : a.date;
        return aDateStr === todayStr;
      })
    : appointments;

  const displayAppts = filteredAppts.sort((a, b) => a.time.localeCompare(b.time)).slice(0, 8);

  const periodLabel = period === 'today' ? "Today's" : period === 'week' ? "This Week's" : period === 'month' ? "This Month's" : "This Year's";

  return (
    <ContentCard
      title={`${periodLabel} Appointments`}
      subtitle={`${displayAppts.length} scheduled for ${period === 'today' ? new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : 'this period'}`}
      icon={<Calendar className="w-5 h-5" />}
      bodyClassName="p-0"
    >
      {displayAppts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-8 ring-primary/5">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-sm font-black text-foreground mb-1 uppercase tracking-[0.1em]">
            Schedule is clear
          </h3>
          <p className="text-[10px] text-muted-foreground text-center font-bold uppercase tracking-widest leading-relaxed">
            No appointments found for {period}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {displayAppts.map((appt, i) => {
            const sm = STATUS_META[appt.status] ?? STATUS_META.scheduled;
            return (
              <div
                key={appt.id || i}
                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-all group"
              >
                <div className="w-16 flex-shrink-0">
                  <span className="text-xs font-black text-primary tracking-tight">
                    {appt.time}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-sm text-foreground truncate tracking-tight">
                      {appt.patientName}
                    </span>
                    <Badge
                      variant={sm.variant}
                      className="text-[8px] font-black uppercase px-1.5 h-4 tracking-tighter"
                    >
                      {sm.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate">
                      {appt.treatmentType || appt.type}
                    </span>
                    {appt.patientPhone && (
                      <span className="text-[10px] text-primary/60 font-mono tracking-tighter flex items-center gap-1 flex-shrink-0 opacity-60">
                        <Phone className="w-3 h-3" />
                        {appt.patientPhone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest flex-shrink-0">
                  {appt.duration || 15} MIN
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ContentCard>
  );
}
