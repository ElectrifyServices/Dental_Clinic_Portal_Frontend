import type { ApiAny } from "../../../types/api";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui";
import { DatePicker } from "@/components/ui/DatePicker";
import { InternalScheduleState } from "@/hooks/staff/useDoctorScheduleQuery";

interface CalendarGridProps {
  monthOffset: number;
  setMonthOffset: (offset: number | ((prev: number) => number)) => void;
  rollingDates: Date[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  appointmentsByDate?: Record<string, number>;
  getDayAppointmentsForDate: (date: Date) => ApiAny[];
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
    <Card className="xl:col-span-6 flex flex-col overflow-hidden h-[420px] sm:h-[460px] xl:h-full shadow-xs">
      <CardContent className="p-2.5 sm:p-3.5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2 sm:mb-2.5 gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">{getCalendarTitle()}</h2>
            <DatePicker
              value={formattedSelectedDate}
              onChange={(val) => handleDatePickerChange({ target: { value: val } } as React.ChangeEvent<HTMLInputElement>)}
              className="h-7 sm:h-7.5 w-auto px-2 text-xs rounded-lg bg-muted/50"
            />
          </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonthOffset((prev) => prev - 1)}
            className="h-7 sm:h-7.5 w-7 sm:w-7.5 rounded-lg border border-border"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <Button
            variant={monthOffset === 0 ? "default" : "outline"}
            onClick={() => {
              setMonthOffset(0);
              setSelectedDate(new Date());
            }}
            className="h-7 sm:h-7.5 px-2.5 sm:px-3 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonthOffset((prev) => prev + 1)}
            className="h-7 sm:h-7.5 w-7 sm:w-7.5 rounded-lg border border-border"
          >
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5">
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-1 sm:p-1.5 text-center text-[9px] sm:text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider bg-muted/40 rounded-md">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
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
              bgClass = "bg-secondary text-primary shadow-xs cursor-pointer";
            }

            let borderClass = "border-transparent hover:border-border";
            if (isToday) {
              borderClass = "border-primary shadow-xs shadow-primary/30";
            } else if (isPast && !isSelected) {
              borderClass = "border-transparent hover:border-border/50";
            } else if (currentDoctorId && scheduleState) {
              borderClass = isWorkingDay 
                ? "border-primary/50 shadow-xs shadow-primary/20 hover:shadow-sm hover:shadow-primary/30 hover:border-primary/80" 
                : "border-red-300/50 shadow-[0_2px_8px_-2px_rgba(239,68,68,0.15)] hover:shadow-[0_4px_12px_-2px_rgba(239,68,68,0.25)] hover:border-red-400/80";
            } 
            if (isSelected && !isToday) {
              borderClass = "border-primary/50 shadow-xs hover:border-primary/80";
            }

            return (
              <div
                key={index}
                onClick={() => handleDateClick(date, isPast, isSelected)}
                className={`aspect-square p-1 sm:p-1.5 rounded-xl transition-all duration-150 border flex flex-col items-center justify-center relative group ${bgClass} ${borderClass}`}
              >
                <span className={`text-xs sm:text-sm font-bold ${isToday ? "text-white" : isPast && !isSelected ? "text-muted-foreground/80" : "text-foreground"}`}>
                  {date.getDate()}
                </span>
                {countToDisplay > 0 && (
                  <div className={`mt-0.5 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded-full ${isToday ? "bg-card/20 text-white" : "bg-primary/10 text-primary"}`}>
                    {countToDisplay}
                  </div>
                )}
                {date.getDate() === 1 && (
                  <div className="absolute top-1 right-1 px-1 py-0 bg-primary text-white text-[7px] font-bold rounded shadow-xs uppercase tracking-tighter">
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
