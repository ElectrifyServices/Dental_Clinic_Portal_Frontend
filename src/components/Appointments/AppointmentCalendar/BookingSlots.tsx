import React from "react";
import { CalendarCheck, Stethoscope, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BookingSlotsProps {
  selectedDoctorId: string | null;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
  availableSlots: any[];
  isLoading?: boolean;
  onBookAppointment?: (doctorId: string, time: string) => void;
}

export const BookingSlots: React.FC<BookingSlotsProps> = ({
  selectedDoctorId,
  selectedTime,
  setSelectedTime,
  availableSlots,
  isLoading,
  onBookAppointment,
}) => {
  return (
    <div className={`bg-card rounded-2xl border border-border p-5 shadow-sm transition-all duration-300 ${selectedDoctorId ? "opacity-100 h-[300px]" : "opacity-50 h-[120px] pointer-events-none"}`}>
      {selectedDoctorId ? (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-foreground tracking-tight">Available Slots</h3>
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2 custom-scrollbar p-1">
            {isLoading ? (
              <div className="col-span-3 py-6 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading slots...</p>
              </div>
            ) : availableSlots.length > 0 ? (
              availableSlots.map((slot, idx) => {
                const isApiDisabled = slot.disabled === true;
                const isDisabled = slot.isPast || isApiDisabled;
                return (
                  <Button
                    key={idx}
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setSelectedTime(slot.time24)}
                    title={isApiDisabled ? "This slot is blocked" : slot.isPast ? "Past slot" : undefined}
                    className={`py-2 rounded-xl text-[9px] font-bold text-center border transition-all relative
                      ${selectedTime === slot.time24 ? "bg-primary border-primary text-white shadow-md scale-[0.98]" :
                        isApiDisabled ? "bg-red-50 text-red-400 border-red-200 cursor-not-allowed line-through opacity-70" :
                        isDisabled ? "bg-muted text-muted-foreground/20 border-transparent cursor-not-allowed" :
                          "bg-emerald-50 text-emerald-700 border-emerald-100 hover:border-emerald-200 hover:bg-emerald-100"}`}
                  >
                    {isApiDisabled ? "" : ""}{slot.time12} {!isApiDisabled && `(${slot.appointmentCount})`}
                  </Button>
                );
              })
            ) : (
              <div className="col-span-3 py-6 text-center">
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">No slots available</p>
              </div>
            )}
          </div>

          <Button
            disabled={!selectedTime}
            onClick={() => selectedTime && onBookAppointment?.(selectedDoctorId, selectedTime)}
            className="w-full mt-4 h-12 rounded-2xl font-bold text-xs gap-2 shadow-lg shadow-primary/10"
          >
            Confirm Selection
            <Check className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center py-6 opacity-30">
          <Stethoscope className="w-8 h-8 text-muted-foreground/40 mb-2" />
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Select specialist first</p>
        </div>
      )}
    </div>
  );
};
