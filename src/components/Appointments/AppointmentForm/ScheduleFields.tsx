import React, { useMemo, useEffect } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { Button } from "@/components/ui";
import { Calendar, Clock, Loader2, CheckCircle, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useAvailableSlotsQuery } from "../../../hooks/appointments/useAvailableSlotsQuery";

interface ScheduleFieldsProps {
  date: string;
  time: string;
  duration: string;
  doctorId: string;
  doctors: any[];
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDurationChange: (val: string) => void;
  onDoctorChange: (val: string) => void;
}

function convert12to24(time12: string): string {
  if (!time12) return "";
  const [timePart, modifier] = time12.split(" ");
  if (!modifier) return time12;
  let [hours, minutes] = timePart.split(":");
  if (hours === "12") hours = "00";
  if (modifier?.toUpperCase() === "PM") hours = String(parseInt(hours, 10) + 12);
  return `${hours.padStart(2, "0")}:${minutes}`;
}

export const ScheduleFields: React.FC<ScheduleFieldsProps> = ({
  date,
  time,
  duration,
  doctorId,
  doctors,
  onDateChange,
  onTimeChange,
  onDurationChange,
  onDoctorChange,
}) => {
  const [doctorSearch, setDoctorSearch] = React.useState("");
  const filteredDoctors = useMemo(() => {
    return (doctors || []).filter(
      (d) =>
        (d.name || "").toLowerCase().includes(doctorSearch.toLowerCase()) ||
        (d.specialization && d.specialization.toLowerCase().includes(doctorSearch.toLowerCase()))
    );
  }, [doctors, doctorSearch]);

  const { data: slotsResponse, isLoading: isLoadingSlots } = useAvailableSlotsQuery(
    doctorId || null,
    date || null
  );

  const slots = useMemo(() => {
    if (!slotsResponse?.data?.slots) return [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return slotsResponse.data.slots.map((slot) => {
      const time24 = convert12to24(slot.time);
      const [h, m] = time24.split(":");
      const slotTime = new Date(date);
      slotTime.setHours(parseInt(h || "0"), parseInt(m || "0"), 0, 0);
      const isPast = slotTime < now;
      return {
        time12: slot.time,
        time24,
        appointmentCount: slot.appointment_count || 0,
        isPast,
      };
    });
  }, [slotsResponse, date]);

  const hasSlots = slots.length > 0;

  useEffect(() => {
    if (doctors?.length === 1 && doctorId !== doctors[0].id) {
      onDoctorChange(doctors[0].id);
    }
  }, [doctors, doctorId, onDoctorChange]);

  const handleSlotClick = (time24: string) => {
    const syntheticEvent = {
      target: { name: "time", value: time24 },
    } as React.ChangeEvent<HTMLInputElement>;
    onTimeChange(syntheticEvent);
  };

  const handleTimeSelect = (val: string) => {
    const syntheticEvent = {
      target: { name: "time", value: val },
    } as React.ChangeEvent<HTMLInputElement>;
    onTimeChange(syntheticEvent);
  };

  return (
    <section className="space-y-3">
      {/* Assigned Doctor — editable */}
      <div className="space-y-3 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-blue-600" />
          </div>
          <h4 className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">
            Assigned Specialist
          </h4>
        </div>
        <div className="space-y-1.5">
          <Select
            value={doctorId}
            onValueChange={onDoctorChange}
          >
            <SelectTrigger className="w-full h-11 px-3 text-sm border border-blue-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 outline-none font-bold shadow-sm transition-all hover:border-blue-300 text-blue-900">
              <SelectValue placeholder="-- Select Specialist --" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur-sm z-10" onKeyDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                <Input
                  placeholder="Search specialist..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  className="h-8 text-xs bg-card"
                />
              </div>
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {filteredDoctors.map((d) => (
                  <SelectItem key={d.id} value={d.id} className="font-medium">
                    {d.name} {d.specialization ? <span className="text-muted-foreground text-xs ml-1">({d.specialization})</span> : null}
                  </SelectItem>
                ))}
                {filteredDoctors.length === 0 && (
                  <p className="text-[10px] text-muted-foreground text-center py-2 italic">No specialists found</p>
                )}
              </div>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
          <Calendar className="w-4 h-4 text-primary" />
        </div>
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
          Schedule & Slot
        </h4>
        <div className="flex-1 h-px bg-muted ml-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Date — editable (Moved to Right) */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
            Date
          </label>
          <div className="relative">
            <Input
              type="date"
              name="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={onDateChange}
              required
              className="h-11 w-full rounded-xl border-border pl-3 pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:z-10"
            />
            <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
          </div>
        </div>

        {/* Time — Select dropdown */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
            Time
          </label>
          <Select
            value={time}
            onValueChange={handleTimeSelect}
            disabled={!doctorId || !date || isLoadingSlots || !hasSlots}
          >
            <SelectTrigger className="w-full h-11 px-3 text-sm border border-border rounded-xl bg-card focus:ring-2 focus:ring-primary/20 outline-none font-medium">
              <SelectValue placeholder={!doctorId || !date ? "Select doctor & date" : isLoadingSlots ? "Loading slots..." : !hasSlots ? "No slots available" : "Select Time"} />
            </SelectTrigger>
            <SelectContent>
              {slots.map((slot) => (
                <SelectItem
                  key={slot.time24}
                  value={slot.time24}
                  disabled={slot.isPast}
                  className="font-medium"
                >
                  {slot.time12} {slot.isPast ? "(Passed)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
            Est. Duration
          </label>
          <Select
            value={duration}
            onValueChange={onDurationChange}
          >
            <SelectTrigger className="w-full h-11 px-3 text-sm border border-border rounded-xl bg-card focus:ring-2 focus:ring-primary/20 outline-none font-medium">
              <SelectValue placeholder="Default (15m)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 Minutes</SelectItem>
              <SelectItem value="30">30 Minutes</SelectItem>
              <SelectItem value="45">45 Minutes</SelectItem>
              <SelectItem value="60">1 Hour</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Available Slots Section */}
      {doctorId && date && (
        <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
              Available Slots
            </span>
            {isLoadingSlots && (
              <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin ml-1" />
            )}
          </div>

          {isLoadingSlots ? (
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-20 rounded-xl bg-emerald-100 animate-pulse"
                />
              ))}
            </div>
          ) : hasSlots ? (
            <div className="flex gap-2 flex-wrap max-h-40 overflow-y-auto p-1.5 custom-scrollbar">
              {slots.map((slot) => {
                const isSelected = time === slot.time24;
                const isDisabled = slot.isPast;
                return (
                  <Button
                    key={slot.time24}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && handleSlotClick(slot.time24)}
                    className={`
                       relative px-3 py-1.5 rounded-xl text-[11px] font-bold border-2 transition-all duration-150 flex items-center gap-1.5 h-auto
                       ${isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200 scale-105 hover:bg-emerald-600"
                        : isDisabled
                          ? "bg-red-50 text-red-300 border-red-100 cursor-not-allowed line-through opacity-50 hover:bg-red-50"
                          : "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 hover:border-emerald-400 cursor-pointer hover:scale-105"
                      }
                     `}
                    title={slot.isPast ? "Time slot has passed" : `Select ${slot.time12}`}
                  >
                    {isSelected && <CheckCircle className="w-3 h-3 flex-shrink-0" />}
                    {slot.time12} ({slot.appointmentCount})
                  </Button>
                );
              })}
            </div>
          ) : (
            <p className="text-[10px] text-emerald-600/60 font-medium italic py-1">
              No slots available for this doctor on selected date.
            </p>
          )}

          <p className="text-[9px] text-emerald-600/50 font-medium flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm inline-block bg-emerald-200 border border-emerald-300" />
              Available
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm inline-block bg-emerald-600" />
              Selected
            </span>
            <span className="ml-auto">Click slot to select time, or choose from the dropdown above.</span>
          </p>
        </div>
      )}

    </section>
  );
};
