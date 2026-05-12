import React from "react";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/Input";

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
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
          <Calendar className="w-4 h-4 text-primary" />
        </div>
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
          Schedule & Slot
        </h4>
        <div className="flex-1 h-px bg-muted ml-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
            Date
          </label>
          <Input
            type="date"
            value={date}
            onChange={onDateChange}
            required
            disabled
            className="h-11 rounded-xl bg-muted/50 border-border opacity-70 cursor-not-allowed"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
            Time
          </label>
          <Input
            type="time"
            value={time}
            onChange={onTimeChange}
            required
            disabled
            className="h-11 rounded-xl bg-muted/50 border-border opacity-70 cursor-not-allowed"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
            Est. Duration
          </label>
          <select
            value={duration}
            onChange={(e) => onDurationChange(e.target.value)}
            className="w-full h-11 px-3 text-sm border border-border rounded-xl bg-muted/50 focus:bg-card focus:ring-2 focus:ring-primary/20 outline-none appearance-none font-medium"
          >
            <option value="">Default (15m)</option>
            <option value="15">15 Minutes</option>
            <option value="30">30 Minutes</option>
            <option value="45">45 Minutes</option>
            <option value="60">1 Hour</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider ml-1">
          Assigned Doctor
        </label>
        <select
          value={doctorId}
          onChange={(e) => onDoctorChange(e.target.value)}
          disabled
          className="w-full h-11 px-3 text-sm border border-border rounded-xl bg-muted/50 opacity-70 cursor-not-allowed outline-none appearance-none font-bold"
        >
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.specialization})
            </option>
          ))}
        </select>
      </div>
    </section>
  );
};
