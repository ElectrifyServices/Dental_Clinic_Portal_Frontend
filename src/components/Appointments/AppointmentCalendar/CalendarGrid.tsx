import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CalendarGridProps {
  monthOffset: number;
  setMonthOffset: (offset: number | ((prev: number) => number)) => void;
  rollingDates: Date[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  appointmentsByDate?: Record<string, number>;
  getDayAppointmentsForDate: (date: Date) => any[];
  monthNames: string[];
  currentDoctorId?: string | null;
  onRefetchSlots?: () => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  monthOffset,
  setMonthOffset,
  rollingDates,
  selectedDate,
  setSelectedDate,
  appointmentsByDate = {},
  getDayAppointmentsForDate,
  monthNames,
  currentDoctorId,
  onRefetchSlots,
}) => {
  const isPastActualDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isTodayDate = (date: Date) => new Date().toDateString() === date.toDateString();

  const handleDateClick = (date: Date, isPast: boolean, isSelected: boolean) => {
    if (isPast) return;
    if (isSelected) {
      onRefetchSlots?.();
    } else {
      setSelectedDate(date);
    }
  };

  const getCalendarTitle = () => {
    const first = rollingDates[0];
    const last = rollingDates[rollingDates.length - 1];
    if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) {
      return `${monthNames[first.getMonth()]} ${first.getFullYear()}`;
    }
    return `${monthNames[first.getMonth()]} - ${monthNames[last.getMonth()]} ${last.getFullYear()}`;
  };

  return (
    <div className="xl:col-span-6 bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col overflow-hidden h-[500px] xl:h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground tracking-tight">{getCalendarTitle()}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonthOffset((prev) => prev - 1)}
            className="h-9 w-9 rounded-xl border border-border"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button
            variant={monthOffset === 0 ? "default" : "outline"}
            onClick={() => setMonthOffset(0)}
            className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonthOffset((prev) => prev + 1)}
            className="h-9 w-9 rounded-xl border border-border"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2 text-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest bg-muted/50 rounded-lg">
              {day}
            </div>
          ))}

          {rollingDates.map((date, index) => {
            const dayAppointments = getDayAppointmentsForDate(date);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            const apiCount = Object.entries(appointmentsByDate).find(([key]) => key.startsWith(dateStr))?.[1] || 0;
            const countToDisplay = currentDoctorId ? dayAppointments.length : Math.max(apiCount as number, dayAppointments.length);
            const isSelected = selectedDate.toDateString() === date.toDateString();
            const isToday = isTodayDate(date);
            const isPast = isPastActualDate(date);

            return (
              <div
                key={index}
                onClick={() => handleDateClick(date, isPast, isSelected)}
                className={`aspect-square p-2 rounded-2xl transition-all duration-200 border-2 flex flex-col items-center justify-center relative group
                  ${isToday ? "bg-primary text-white shadow-lg border-primary" : 
                    isSelected ? "bg-secondary text-primary border-primary/20 shadow-sm" : 
                    isPast ? "bg-muted text-muted-foreground/40 border-transparent opacity-40 cursor-not-allowed" : 
                    "bg-card border-transparent hover:border-border cursor-pointer"}`}
              >
                <span className={`text-sm md:text-base font-bold ${isToday ? "text-white" : isPast ? "text-muted-foreground/60" : "text-foreground"}`}>
                  {date.getDate()}
                </span>
                {countToDisplay > 0 && (
                  <div className={`mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isToday ? "bg-card/20 text-white" : "bg-primary/10 text-primary"}`}>
                    {countToDisplay}
                  </div>
                )}
                {date.getDate() === 1 && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-primary text-white text-[8px] font-bold rounded shadow-sm uppercase tracking-tighter">
                    {monthNames[date.getMonth()].slice(0, 3)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
