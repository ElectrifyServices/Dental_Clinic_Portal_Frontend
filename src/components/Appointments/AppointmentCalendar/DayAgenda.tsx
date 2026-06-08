import React from "react";
import { Calendar as CalendarIcon, Clock, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface DayAgendaProps {
  selectedDate: Date;
  appointments: any[];
  onEditAppointment?: (appointment: any) => void;
  formatTime: (time: string) => string;
}

export const DayAgenda: React.FC<DayAgendaProps> = ({
  selectedDate,
  appointments,
  onEditAppointment,
  formatTime,
}) => {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">
          {selectedDate.toLocaleDateString("en-IN", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
        {appointments.length > 0 ? (
          appointments.map((apt, index) => (
            <div
              key={index}
              onClick={() => onEditAppointment?.(apt)}
              className="p-4 bg-muted/50 hover:bg-secondary/50 rounded-2xl border border-border hover:border-primary/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(apt.time)}
                </span>
                <Badge
                  variant={apt.status === "checked-in" ? "green" : "blue"}
                  className="text-[8px] uppercase tracking-wider"
                >
                  {apt.status || "Booked"}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground/60 font-bold text-xs group-hover:text-primary transition-colors">
                  {(apt.patientName || "?").charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-foreground truncate tracking-tight">
                    {apt.patientName}
                  </p>
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground/60 font-medium">
                    <Stethoscope className="w-2.5 h-2.5" />
                    <span className="truncate">
                      {apt.treatment || "Consultation"}
                    </span>
                  </div>
                  <p className="text-[8px] font-bold text-primary/60 mt-1 uppercase tracking-tighter">
                    {apt.duration || 15} mins duration
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-30">
            <CalendarIcon className="w-10 h-10 text-muted-foreground/20 mb-2" />
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              No entries
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
