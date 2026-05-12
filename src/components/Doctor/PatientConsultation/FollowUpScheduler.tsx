import React from "react";
import { Clock, CheckCircle, Calendar as CalendarIcon } from "lucide-react";

interface FollowUpSchedulerProps {
  followUpRequired: boolean;
  bookedFollowUp: { date: string; time: string } | null;
  followUpDoctorId: string;
  followUpDate: string;
  selectedSlot: string | null;
  availableSlots: { time24: string; time12: string }[];
  doctors: any[];
  onFollowUpRequiredChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDoctorChange: (id: string) => void;
  onDateChange: (date: string) => void;
  onSlotSelect: (slot: string) => void;
  onSchedule: () => void;
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
  onSchedule
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
    const [h, m] = time24.split(':');
    const hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const h12 = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
    return `${h12}:${m} ${ampm}`;
  };

  return (
    <div className="px-6">
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          name="followUpRequired"
          checked={followUpRequired}
          onChange={onFollowUpRequiredChange}
          className="w-4 h-4 text-primary border-border rounded focus:ring-primary cursor-pointer"
        />
        <span className="ml-2 text-sm font-medium text-muted-foreground">
          Follow-up appointment required
        </span>
      </div>

      {followUpRequired && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-top-2 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h4 className="text-sm font-bold text-blue-900 flex items-center uppercase tracking-wider">
              <Clock className="w-4 h-4 mr-2" />
              Follow-up Booking
            </h4>
            {bookedFollowUp ? (
              <div className="flex items-center text-emerald-600 font-bold text-sm bg-card px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Follow-up booked: {formatFollowUpDate(bookedFollowUp.date)}, {formatSlotTime(bookedFollowUp.time)}
              </div>
            ) : (
              <div className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                Select a slot to schedule
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-primary mb-2 uppercase tracking-widest">
                Assign Doctor
              </label>
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
              <label className="block text-[10px] font-bold text-primary mb-2 uppercase tracking-widest">
                Preferred Date
              </label>
              <input
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
              <label className="block text-[10px] font-bold text-primary uppercase tracking-widest">
                Available Slots
              </label>
              {availableSlots.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border border-primary/20 rounded-xl bg-card/50 custom-scrollbar">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time24}
                      type="button"
                      onClick={() => onSlotSelect(slot.time24)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedSlot === slot.time24
                        ? "bg-primary text-white shadow-lg scale-105"
                        : "bg-card text-primary border border-primary/30 hover:border-primary hover:bg-primary/10 hover:shadow-sm"
                        }`}
                    >
                      {slot.time12}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-card/50 border border-dashed border-primary/30 rounded-2xl">
                  <p className="text-sm text-muted-foreground/60 italic">No slots available for this doctor on this date.</p>
                </div>
              )}

              <button
                type="button"
                onClick={onSchedule}
                disabled={!selectedSlot && availableSlots.length === 0}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl hover:shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Schedule Follow-up Appointment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
