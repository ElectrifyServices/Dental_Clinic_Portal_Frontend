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

          <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2 custom-scrollbar pr-1">
            {isLoading ? (
              <div className="col-span-3 py-6 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading slots...</p>
              </div>
            ) : availableSlots.length > 0 ? (
              availableSlots.map((slot, idx) => {
                const isDisabled = slot.isBooked || slot.isPast;
                return (
                  <button
                    key={idx}
                    disabled={isDisabled}
                    onClick={() => setSelectedTime(slot.time24)}
                    className={`py-2 rounded-xl text-[9px] font-bold text-center border transition-all relative
                      ${selectedTime === slot.time24 ? "bg-primary border-primary text-white shadow-md scale-[0.98]" :
                        isDisabled ? "bg-muted text-muted-foreground/20 border-transparent cursor-not-allowed" :
                          "bg-emerald-50 text-emerald-700 border-emerald-100 hover:border-emerald-200 hover:bg-emerald-100"}`}
                  >
                    {slot.time12}
                    {slot.isBooked && (
                      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-400 rounded-full border border-white" />
                    )}
                  </button>
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
