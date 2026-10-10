import type { ApiAny } from "../../../types/api";
import React from "react";
import { Calendar as CalendarIcon, Clock, Stethoscope, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface DayAgendaProps {
  selectedDate: Date;
  appointments: ApiAny[];
  onEditAppointment?: (appointment: ApiAny) => void;
  onDirectCheckIn?: (appointment: ApiAny) => void;
  formatTime: (time: string) => string;
  checkingInApptId?: string | null;
}

export const DayAgenda: React.FC<DayAgendaProps> = ({
  selectedDate,
  appointments,
  onEditAppointment,
  onDirectCheckIn,
  formatTime,
  checkingInApptId,
}) => {
  return (
    <div className="bg-card rounded-2xl border border-border p-2.5 sm:p-3 shadow-xs flex-1 flex flex-col overflow-hidden min-h-[160px]">
      <div className="flex items-center gap-1.5 mb-2">
        <CalendarIcon className="w-3.5 h-3.5 text-primary" />
        <h3 className="text-xs font-bold text-foreground">
          {selectedDate.toLocaleDateString("en-IN", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-0.5">
        {appointments.length > 0 ? (
          appointments.map((apt, index) => (
            <div
              key={index}
              onClick={() => onEditAppointment?.(apt)}
              className="p-2 sm:p-2.5 bg-muted/40 hover:bg-secondary/40 rounded-xl border border-border hover:border-primary/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9.5px] font-bold text-primary flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(apt.time)}
                </span>
                <Badge
                  variant={apt.status === "checked-in" ? "green" : "blue"}
                  className="text-[7.5px] uppercase tracking-wider px-1.5 py-0.5"
                >
                  {apt.status || "Booked"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6.5 h-6.5 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground/60 font-bold text-[10px] group-hover:text-primary transition-colors shrink-0">
                  {(apt.patientName || "?").charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-foreground truncate tracking-tight">
                    {apt.patientName}
                  </p>
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground/70 font-medium">
                    <Stethoscope className="w-2.5 h-2.5" />
                    <span className="truncate">
                      {apt.treatment || "Consultation"}
                    </span>
                  </div>
                  <p className="text-[7.5px] font-bold text-primary/70 mt-0.5 uppercase tracking-tighter">
                    {apt.duration || 15} mins duration
                  </p>
                </div>
              </div>

              {onDirectCheckIn && !['completed', 'cancelled', 'checked-in', 'no-show'].includes(apt.status) && (() => {
                const isCheckingIn = checkingInApptId === apt.id;
                return (
                  <div className="mt-2 pt-1.5 border-t border-border/50 flex justify-end">
                    <Button
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDirectCheckIn(apt);
                      }}
                      disabled={isCheckingIn}
                      className="h-6 px-2 text-[9px] font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg gap-1"
                    >
                      {isCheckingIn ? (
                        <span className="w-2.5 h-2.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <UserCheck className="w-2.5 h-2.5" />
                      )}
                      {isCheckingIn ? "Checking in..." : "Direct check-in"}
                    </Button>
                  </div>
                );
              })()}
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-5 opacity-40">
            <CalendarIcon className="w-7 h-7 text-muted-foreground/30 mb-1" />
            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              No entries
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
