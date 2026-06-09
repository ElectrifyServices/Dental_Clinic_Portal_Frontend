import { Clock } from "lucide-react";

interface Slot {
  time24: string;
  time12: string;
  isBooked: boolean;
  isPast: boolean;
}

interface TimeSlotGridProps {
  slots: Slot[];
  selectedTime: string;
  onSelectTime: (time: string) => void;
}

export function TimeSlotGrid({
  slots,
  selectedTime,
  onSelectTime,
}: TimeSlotGridProps) {
  return (
    <div className="bg-muted/50 p-4 rounded-2xl border border-border">
      {slots.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {slots.map((slot) => (
            <button
              key={slot.time24}
              disabled={slot.isBooked || slot.isPast}
              onClick={() => onSelectTime(slot.time12)}
              className={`py-2.5 px-2 text-xs font-bold rounded-full border transition-all flex items-center justify-center ${
                slot.isBooked || slot.isPast
                  ? "bg-muted text-muted-foreground/60 border-border cursor-not-allowed opacity-60"
                  : selectedTime === slot.time12
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-primary shadow-md transform scale-105"
                    : "bg-green-50/50 text-green-700 border-green-200 hover:border-green-400 hover:bg-green-50"
              }`}
            >
              {slot.time12}
            </button>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-card rounded-xl border border-dashed border-border">
          <Clock className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No working hours for this doctor today.
          </p>
        </div>
      )}
    </div>
  );
}
