import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import React from "react";
import { Clock, CheckCircle, Calendar as CalendarIcon } from "lucide-react";

interface FollowUpSchedulerProps {
  followUpRequired: boolean;
  bookedFollowUp: { date: string; time: string } | null;
  followUpDoctorId: string;
  followUpDate: string;
  selectedSlot: string | null;
  availableSlots: { time24: string; time12: string; isAvailable: boolean }[];
  doctors: any[];
  onFollowUpRequiredChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDoctorChange: (id: string) => void;
  onDateChange: (date: string) => void;
  onSlotSelect: (slot: string) => void;
  onSchedule: () => void;
  errors?: Record<string, string>;
}

export function FollowUpScheduler({
  followUpRequired,
  bookedFollowUp,
  followUpDoctorId,
  followUpDate,
  selectedSlot,
  availableSlots,
  doctors,
  onFollowUpRequiredChange,
  onDoctorChange,
  onDateChange,
  onSlotSelect,
  onSchedule,
  errors = {}
}: FollowUpSchedulerProps) {
  const formatFollowUpDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long'
      });
    } catch {
      return dateStr;
    }
  };

  const formatSlotTime = (time24: string) => {
    if (time24.includes('AM') || time24.includes('PM')) return time24;
    const [h, m] = time24.split(':');
    const hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const h12 = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
    return `${h12}:${m} ${ampm}`;
  };

  return (
    <div className="px-6">
      {followUpRequired && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-top-2 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h4 className="text-sm font-bold text-blue-900 flex items-center uppercase tracking-wider">
              <Clock className="w-4 h-4 mr-2" />
              Follow-up Booking
            </h4>
            {selectedSlot ? (
              <div className="flex items-center text-emerald-600 font-bold text-sm bg-card px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Selected slot: {formatSlotTime(selectedSlot)}
              </div>
            ) : (
              <div className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                Select a slot
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-[10px] font-bold text-primary mb-2 uppercase tracking-widest">
                Assign Doctor
              </Label>
              <select
                value={followUpDoctorId}
                onChange={(e) => onDoctorChange(e.target.value)}
                disabled={!!bookedFollowUp}
                className="w-full px-4 py-2.5 bg-card border border-primary/30 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm disabled:bg-muted disabled:cursor-not-allowed"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="block text-[10px] font-bold text-primary mb-2 uppercase tracking-widest">
                Preferred Date
              </Label>
              <Input
                type="date"
                value={followUpDate}
                onChange={(e) => onDateChange(e.target.value)}
                disabled={!!bookedFollowUp}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2.5 bg-card border border-primary/30 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {!bookedFollowUp && (
            <div className="space-y-4">
              <Label className="block text-[10px] font-bold text-primary uppercase tracking-widest">
                Available Slots
              </Label>
              {availableSlots.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border border-primary/20 rounded-xl bg-card/50 custom-scrollbar">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot === slot.time24;
                      const isBooked = !slot.isAvailable;
                      return (
                        <Button
                          key={slot.time24}
                          type="button"
                          disabled={isBooked}
                          onClick={() => !isBooked && onSlotSelect(slot.time24)}
                          className={`
                            relative px-3 py-1.5 rounded-xl text-[11px] font-bold border-2 transition-all duration-150 flex items-center gap-1.5
                            ${isSelected
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200 scale-105"
                              : isBooked
                              ? "bg-red-50 text-red-300 border-red-100 cursor-not-allowed line-through opacity-50"
                              : "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 hover:border-emerald-400 cursor-pointer hover:scale-105"
                            }
                          `}
                          title={isBooked ? "Already booked" : `Select ${slot.time12}`}
                        >
                          {isSelected && <CheckCircle className="w-3 h-3 flex-shrink-0 text-white" />}
                          {slot.time12}
                          {isBooked && (
                            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-400 border border-white" />
                          )}
                        </Button>
                      );
                    })}
                  </div>

                  <p className="text-[9px] text-primary/50 font-medium flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block bg-emerald-200 border border-emerald-300" />
                      Available
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block bg-emerald-600" />
                      Selected
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block bg-red-100 border border-red-200" />
                      Booked
                    </span>
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 bg-card/50 border border-dashed border-primary/30 rounded-2xl">
                  <p className="text-sm text-muted-foreground/60 italic">No slots available for this doctor on this date.</p>
                </div>
              )}
              {errors?.followUpSlot && (
                <p className="mt-1.5 text-xs font-semibold text-destructive flex items-center gap-1">
                  <span>⚠</span> {errors.followUpSlot}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
