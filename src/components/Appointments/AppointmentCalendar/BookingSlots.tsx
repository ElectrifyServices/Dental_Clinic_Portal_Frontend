import type { ApiAny } from "../../../types/api";
import React, { useState } from "react";
import { CalendarCheck, Stethoscope, Check, Ban } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BlockTimeModal } from "./BlockTimeModal";
 
interface BookingSlotsProps {
  selectedDoctorId: string | null;
  selectedDoctorName?: string;
  /** "YYYY-MM-DD" — required to open Block Time */
  selectedDate?: string;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
  availableSlots: ApiAny[];
  isLoading?: boolean;
  onBookAppointment?: (doctorId: string, time: string) => void;
}

export const BookingSlots: React.FC<BookingSlotsProps> = ({
  selectedDoctorId,
  selectedDoctorName,
  selectedDate,
  selectedTime,
  setSelectedTime,
  availableSlots,
  isLoading,
  onBookAppointment,
}) => {
  const [showBlockTime, setShowBlockTime] = useState(false);

  return (
    <div className={`bg-card rounded-2xl border border-border p-2.5 sm:p-3 shadow-xs transition-all duration-300 ${selectedDoctorId ? "opacity-100 h-[220px] xl:h-[240px]" : "opacity-50 h-[80px] sm:h-[90px] pointer-events-none"}`}>
      {selectedDoctorId ? (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-500" />
              <h3 className="text-xs font-bold text-foreground tracking-tight">Available Slots</h3>
            </div>
            {selectedDate && (
              <Button
                variant="ghost"
                onClick={() => setShowBlockTime(true)}
                className="h-6 px-1.5 rounded-md text-[9px] font-bold text-red-600 hover:bg-red-50 gap-1"
              >
                <Ban className="w-3 h-3" />
                Block Time
              </Button>
            )}
          </div>

          {showBlockTime && selectedDoctorId && selectedDate && (
            <BlockTimeModal
              doctorId={selectedDoctorId}
              doctorName={selectedDoctorName}
              date={selectedDate}
              onClose={() => setShowBlockTime(false)}
            />
          )}

          <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-1.5 custom-scrollbar p-0.5">
            {isLoading ? (
              <div className="col-span-3 py-4 text-center">
                <p className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading slots...</p>
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
                    className={`py-1 sm:py-1.5 px-1 rounded-lg text-[9px] font-bold text-center border transition-all relative h-auto
                      ${selectedTime === slot.time24 ? "bg-primary border-primary text-white shadow-xs scale-[0.98]" :
                        isApiDisabled ? "bg-red-50 text-red-400 border-red-200 cursor-not-allowed line-through opacity-70" :
                        isDisabled ? "bg-muted text-muted-foreground/20 border-transparent cursor-not-allowed" :
                          "bg-emerald-50 text-emerald-700 border-emerald-100 hover:border-emerald-200 hover:bg-emerald-100"}`}
                  >
                    {isApiDisabled ? "" : ""}{slot.time12} {!isApiDisabled && `(${slot.appointmentCount})`}
                  </Button>
                );
              })
            ) : (
              <div className="col-span-3 py-4 text-center">
                <p className="text-[9.5px] font-bold text-red-400 uppercase tracking-widest">No slots available</p>
              </div>
            )}
          </div>

          <Button
            disabled={!selectedTime}
            onClick={() => selectedTime && onBookAppointment?.(selectedDoctorId, selectedTime)}
            className="w-full mt-2 h-8 sm:h-8.5 rounded-xl font-bold text-xs gap-1.5 shadow-xs"
          >
            Confirm Selection
            <Check className="w-3.5 h-3.5" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center py-4 opacity-40">
          <Stethoscope className="w-6 h-6 text-muted-foreground/40 mb-1" />
          <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Select specialist first</p>
        </div>
      )}
    </div>
  );
};
