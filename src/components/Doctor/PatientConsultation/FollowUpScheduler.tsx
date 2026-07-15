import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import React from "react";
import { Clock, CheckCircle, Calendar as CalendarIcon } from "lucide-react";

interface FollowUpSchedulerProps {
  followUpRequired: boolean;
  bookedFollowUp: { date: string; time: string } | null;
  followUpDoctorId: string;
  followUpDate: string;
  selectedSlot: string | null;
  availableSlots: { time24: string; time12: string; appointmentCount: number; disabled?: boolean }[];
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
              <Label className="block text-[10px] font-bold text-blue-900 mb-2 uppercase tracking-widest">
                Assign Doctor
              </Label>
              <Select
                value={followUpDoctorId}
                onValueChange={onDoctorChange}
                disabled={!!bookedFollowUp}
              >
                <SelectTrigger className="rounded-xl text-sm border-primary/30">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} ({d.specialization})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-[10px] font-bold text-blue-900 mb-2 uppercase tracking-widest">
                Preferred Date
              </Label>
              <Input
                type="date"
                value={followUpDate}
                onChange={(e) => onDateChange(e.target.value)}
                disabled={!!bookedFollowUp}
                min={(() => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, "0");
                  const day = String(today.getDate()).padStart(2, "0");
                  return `${year}-${month}-${day}`;
                })()}
                className="w-full px-4 py-2.5 bg-card border border-primary/30 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {!bookedFollowUp && (
            <div className="space-y-4">
              <Label className="block text-[10px] font-bold text-blue-900 uppercase tracking-widest">
                Available Slots
              </Label>
              {availableSlots.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border border-primary/20 rounded-xl bg-card/50 custom-scrollbar">
                    {availableSlots.map((slot) => {
                      const isApiDisabled = slot.disabled === true;
                      const isSelected = selectedSlot === slot.time24;
                      return (
                        <Button
                          key={slot.time24}
                          type="button"
                          disabled={isApiDisabled}
                          onClick={() => !isApiDisabled && onSlotSelect(slot.time24)}
                          className={`
                            relative px-3 py-1.5 rounded-xl text-[11px] font-bold border-2 transition-all duration-150 flex items-center gap-1.5
                            ${isApiDisabled
                              ? "bg-red-50 text-red-400 border-red-200 cursor-not-allowed line-through opacity-70"
                              : isSelected
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200 scale-105"
                                : "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 hover:border-emerald-400 cursor-pointer hover:scale-105"
                            }
                          `}
                          title={isApiDisabled ? "This slot is blocked" : `Select ${slot.time12}`}
                        >
                          {isApiDisabled ? "🔒 " : (isSelected && <CheckCircle className="w-3 h-3 flex-shrink-0 text-white" />)}
                          {isApiDisabled ? slot.time12 : `${slot.time12} (${slot.appointmentCount})`}
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
