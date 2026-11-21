import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui";
import { InternalScheduleState } from "@/hooks/staff/useDoctorScheduleQuery";

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
  scheduleState?: InternalScheduleState | null;
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
  scheduleState,
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

  const handleDateClick = (date: Date, _isPast: boolean, isSelected: boolean) => {
    if (isSelected) {
      onRefetchSlots?.();
    } else {
      setSelectedDate(date);
    }
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const newDate = new Date(e.target.value);
      setSelectedDate(newDate);
      const today = new Date();
      const monthDiff = (newDate.getFullYear() - today.getFullYear()) * 12 + (newDate.getMonth() - today.getMonth());
      setMonthOffset(monthDiff);
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

  const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  const formattedSelectedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  return (
    <Card className="xl:col-span-6 flex flex-col overflow-hidden h-[500px] xl:h-full shadow-sm">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground tracking-tight">{getCalendarTitle()}</h2>
            <input 
              type="date" 
              value={formattedSelectedDate}
              onChange={handleDatePickerChange}
              className="h-8 px-2 text-xs rounded-lg border border-border bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
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
            onClick={() => {
              setMonthOffset(0);
              setSelectedDate(new Date());
            }}
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
            // The calendar endpoint may return the combined clinic count. Once a
            // doctor is selected, the appointments loaded for this page are the
            // source of truth for the doctor-specific day count.
            const countToDisplay = currentDoctorId
              ? dayAppointments.length
              : Math.max(apiCount as number, dayAppointments.length);
            const isSelected = selectedDate.toDateString() === date.toDateString();
            const isToday = isTodayDate(date);
            const isPast = isPastActualDate(date);
            
            const dayName = DAY_NAMES[date.getDay()];
            const isWorkingDay = scheduleState?.workingHours?.[dayName]?.isWorking;

            let bgClass = "bg-card hover:bg-muted/50 cursor-pointer";
            if (isToday) {
              bgClass = "bg-primary text-white shadow-lg cursor-pointer";
            } else if (isPast) {
              bgClass = "bg-muted text-muted-foreground/80 cursor-pointer opacity-60 hover:bg-muted/80";
            } else if (isSelected) {
              bgClass = "bg-secondary text-primary shadow-sm cursor-pointer";
            }

            let borderClass = "border-transparent hover:border-border";
            if (isToday) {
              borderClass = "border-primary shadow-md shadow-primary/30";
            } else if (isPast && !isSelected) {
              borderClass = "border-transparent hover:border-border/50";
            } else if (currentDoctorId && scheduleState) {
              borderClass = isWorkingDay 
                ? "border-primary/50 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:border-primary/80" 
                : "border-red-300/50 shadow-[0_4px_12px_-2px_rgba(239,68,68,0.15)] hover:shadow-[0_6px_16px_-2px_rgba(239,68,68,0.25)] hover:border-red-400/80";
            } 
            if (isSelected && !isToday) {
              borderClass = "border-primary/50 shadow-sm hover:border-primary/80";
            }

            return (
              <div
                key={index}
                onClick={() => handleDateClick(date, isPast, isSelected)}
                className={`aspect-square p-2 rounded-2xl transition-all duration-200 border-2 flex flex-col items-center justify-center relative group ${bgClass} ${borderClass}`}
              >
                <span className={`text-sm md:text-base font-bold ${isToday ? "text-white" : isPast && !isSelected ? "text-muted-foreground/80" : "text-foreground"}`}>
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
      </CardContent>
    </Card>
  );
};
