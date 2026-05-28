import { useState, useEffect } from "react";
import { Save, Clock, Calendar, AlertTriangle, Loader2 } from "lucide-react";
import { Modal, Button, LabeledField, Badge } from "@/components/ui";
import {
  useCreateDoctorScheduleMutation,
  mapScheduleToPayload,
} from "@/hooks/staff/useCreateDoctorScheduleMutation";
import {
  useDoctorScheduleQuery,
  mapApiResponseToScheduleState,
} from "@/hooks/staff/useDoctorScheduleQuery";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DaySchedule {
  isWorking: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

interface WorkingHours {
  [key: string]: DaySchedule;
}

interface DoctorScheduleManagerProps {
  doctorId: string;
  doctorName: string;
  onClose: () => void;
  onSave: (data: any) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  { key: "monday",    label: "Monday" },
  { key: "tuesday",   label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday",  label: "Thursday" },
  { key: "friday",    label: "Friday" },
  { key: "saturday",  label: "Saturday" },
  { key: "sunday",    label: "Sunday" },
];

const EMPTY_SCHEDULE: WorkingHours = {
  monday:    { isWorking: false, startTime: "", endTime: "" },
  tuesday:   { isWorking: false, startTime: "", endTime: "" },
  wednesday: { isWorking: false, startTime: "", endTime: "" },
  thursday:  { isWorking: false, startTime: "", endTime: "" },
  friday:    { isWorking: false, startTime: "", endTime: "" },
  saturday:  { isWorking: false, startTime: "", endTime: "" },
  sunday:    { isWorking: false, startTime: "", endTime: "" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert "HH:MM" to total minutes */
function timeToMins(t: string): number {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Convert total minutes to "HH:MM" */
function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Convert "HH:MM" (24h) to "HH:MM AM/PM" (12h) */
function formatTo12Hr(t: string): string {
  if (!t || !t.includes(":")) return t;
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${String(displayHour).padStart(2, "0")}:${mStr} ${ampm}`;
}

/**
 * Calculate end time given a start time, slot count, slot duration and buffer.
 * Total time = slots × duration + (slots - 1) × buffer
 */
function calcEndTime(startTime: string, slots: number, duration: number, buffer: number): string {
  if (!startTime || slots <= 0) return "";
  const totalMins = slots * duration + (slots - 1) * buffer;
  return minsToTime(timeToMins(startTime) + totalMins);
}

/**
 * Derive how many full slots fit in the usable window (excluding break time).
 */
function calcSlotCount(
  startTime: string,
  endTime: string,
  breakStart: string | undefined,
  breakEnd: string | undefined,
  duration: number,
  buffer: number,
): number {
  if (!startTime || !endTime) return 0;
  const step = duration + buffer;
  if (step <= 0) return 0;

  const start = timeToMins(startTime);
  const end   = timeToMins(endTime);
  const bS = breakStart ? timeToMins(breakStart) : null;
  const bE = breakEnd   ? timeToMins(breakEnd)   : null;

  let count = 0;
  let cur   = start;
  while (cur + duration <= end) {
    // Skip break window
    if (bS !== null && bE !== null && cur >= bS && cur < bE) {
      cur = bE;
      continue;
    }
    count++;
    cur += step;
  }
  return count;
}

interface HourMinPickerProps {
  value: string;
  onChange: (newValue: string) => void;
  optional?: boolean;
}

function HourMinPicker({ value, onChange, optional = false }: HourMinPickerProps) {
  const [hStr, mStr] = value && value.includes(":") ? value.split(":") : ["", ""];
  
  const hours = Array.from({ length: 24 }, (_, i) => {
    const val = String(i).padStart(2, "0");
    const ampm = i >= 12 ? "PM" : "AM";
    const displayHour = i % 12 === 0 ? 12 : i % 12;
    const label = `${String(displayHour).padStart(2, "0")} ${ampm}`;
    return { val, label };
  });

  const minutes = Array.from({ length: 12 }, (_, i) => {
    const val = String(i * 5).padStart(2, "0");
    return val;
  });

  const handleHourChange = (newH: string) => {
    if (!newH) {
      if (optional) onChange("");
      return;
    }
    const currentM = mStr || "00";
    onChange(`${newH}:${currentM}`);
  };

  const handleMinChange = (newM: string) => {
    const currentH = hStr || "09";
    onChange(`${currentH}:${newM}`);
  };

  return (
    <div className="flex gap-1 items-center w-full">
      <select
        value={hStr}
        onChange={(e) => handleHourChange(e.target.value)}
        className="w-[60%] px-1.5 py-1.5 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none bg-card"
      >
        <option value="">Hour</option>
        {hours.map((h) => (
          <option key={h.val} value={h.val}>
            {h.label}
          </option>
        ))}
      </select>
      <span className="text-muted-foreground font-black text-xs">:</span>
      <select
        value={mStr}
        disabled={!hStr}
        onChange={(e) => handleMinChange(e.target.value)}
        className="w-[40%] px-1.5 py-1.5 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none bg-card disabled:opacity-50"
      >
        <option value="">Min</option>
        {minutes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DoctorScheduleManager({
  doctorId,
  doctorName,
  onClose,
  onSave,
}: DoctorScheduleManagerProps) {
  const [schedule, setSchedule] = useState<WorkingHours>(EMPTY_SCHEDULE);
  const [settings, setSettings] = useState({ duration: 30, bufferTime: 5 });
  // Per-day slot counts (UI-only — drives end_time calculation)
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  // ── Fetch existing schedule ───────────────────────────────────────────────
  const {
    data: apiScheduleData,
    isLoading: isScheduleLoading,
    isError: isScheduleError,
    isFetching,
  } = useDoctorScheduleQuery(doctorId);

  // Populate form once API data arrives
  useEffect(() => {
    if (initialized || isFetching || isScheduleLoading) return;
    
    // By this point, the query has finished (either from network or cache without refetching)
    if (apiScheduleData && !isScheduleError) {
      const parsed = mapApiResponseToScheduleState(apiScheduleData);
      if (parsed) {
        setSchedule(parsed.workingHours);
        setSettings({ duration: parsed.slotDuration, bufferTime: parsed.bufferTime });

        // Derive initial slot counts from API data
        const derived: Record<string, number> = {};
        for (const [key, day] of Object.entries(parsed.workingHours)) {
          if (day.isWorking && day.startTime && day.endTime) {
            derived[key] = calcSlotCount(
              day.startTime,
              day.endTime,
              day.breakStart,
              day.breakEnd,
              parsed.slotDuration,
              parsed.bufferTime,
            );
          }
        }
        setSlotCounts(derived);
      }
    }
    
    // Always mark as initialized after the first complete fetch/cache hit
    setInitialized(true);
  }, [apiScheduleData, initialized, isFetching, isScheduleLoading, isScheduleError]);

  // ── Save mutation ─────────────────────────────────────────────────────────
  const { mutateAsync: createSchedule, isPending } =
    useCreateDoctorScheduleMutation();

  // ── Slot count handler — updates end_time automatically ──────────────────
  const handleSlotCountChange = (dayKey: string, rawValue: string) => {
    const count = Math.max(1, parseInt(rawValue, 10) || 1);
    setSlotCounts((prev) => ({ ...prev, [dayKey]: count }));

    const day = schedule[dayKey];
    if (!day?.startTime) return;

    const newEnd = calcEndTime(day.startTime, count, settings.duration, settings.bufferTime);
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], endTime: newEnd },
    }));
  };

  // ── Start time handler — keeps slot count locked, recalculates end_time ──
  const handleStartTimeChange = (dayKey: string, newStart: string) => {
    const count = slotCounts[dayKey] ?? 0;
    let newEnd = schedule[dayKey]?.endTime ?? "";
    if (count > 0 && newStart) {
      newEnd = calcEndTime(newStart, count, settings.duration, settings.bufferTime);
    }
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], startTime: newStart, endTime: newEnd },
    }));
  };

  // ── End time handler — derives slot count from time window ────────────────
  const handleEndTimeChange = (dayKey: string, newEnd: string) => {
    const day = schedule[dayKey];
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], endTime: newEnd },
    }));
    // Recompute slot count from new window
    if (day?.startTime && newEnd) {
      const derived = calcSlotCount(
        day.startTime,
        newEnd,
        day.breakStart,
        day.breakEnd,
        settings.duration,
        settings.bufferTime,
      );
      setSlotCounts((prev) => ({ ...prev, [dayKey]: derived }));
    }
  };

  // ── When global settings change, recompute all end times from slot counts ─
  const handleSettingsChange = (field: "duration" | "bufferTime", value: number) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);

    // Recompute end times for all working days that have a slot count set
    setSchedule((prev) => {
      const updated = { ...prev };
      for (const dayKey of Object.keys(updated)) {
        const day = updated[dayKey];
        const count = slotCounts[dayKey] ?? 0;
        if (day.isWorking && day.startTime && count > 0) {
          updated[dayKey] = {
            ...day,
            endTime: calcEndTime(day.startTime, count, newSettings.duration, newSettings.bufferTime),
          };
        }
      }
      return updated;
    });
  };

  // ── Generic day field handler (isWorking, breakStart, breakEnd) ───────────
  const handleDayChange = (dayKey: string, field: string, value: any) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], [field]: value },
    }));
  };

  // ── Generate preview slots ────────────────────────────────────────────────
  const generateTimeSlots = (dayKey: string): string[] => {
    const day = schedule[dayKey];
    if (!day?.isWorking || !day.startTime || !day.endTime) return [];

    const slots: string[] = [];
    const bS = day.breakStart ? timeToMins(day.breakStart) : null;
    const bE = day.breakEnd   ? timeToMins(day.breakEnd)   : null;
    const end = timeToMins(day.endTime);
    const step = settings.duration + settings.bufferTime;

    let cur = timeToMins(day.startTime);
    while (cur + settings.duration <= end) {
      if (bS !== null && bE !== null && cur >= bS && cur < bE) {
        cur = bE;
        continue;
      }
      slots.push(minsToTime(cur));
      cur += step;
    }
    return slots;
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaveError(null);

    // Validate that all checked working days have start/end times and complete break times if configured
    for (const [dayKey, day] of Object.entries(schedule)) {
      if (day.isWorking) {
        const capitalizedDay = dayKey.charAt(0).toUpperCase() + dayKey.slice(1);
        
        if (!day.startTime || !day.endTime) {
          setSaveError(`Please select both Start Time and End Time for ${capitalizedDay}.`);
          return;
        }
        
        if ((day.breakStart && !day.breakEnd) || (!day.breakStart && day.breakEnd)) {
          setSaveError(`Please configure both Break Start and Break End times for ${capitalizedDay}, or clear both.`);
          return;
        }
      }
    }

    try {
      const payload = mapScheduleToPayload(schedule, settings);
      await createSchedule({ doctorId, payload });
      onSave({ doctorId, workingHours: schedule, timeSlots: settings });
    } catch (err: any) {
      // Extract detailed validation messages from backend responseObject if available
      const backendErr = err?.response?.data?.responseStatusList?.statusList?.[0]?.statusDesc ||
                        err?.response?.data?.message ||
                        err?.message ||
                        "Failed to save schedule.";
      setSaveError(backendErr);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Modal
      title="Staff Schedule Manager"
      subtitle={doctorName}
      onClose={onClose}
      size="2xl"
      icon={<Clock className="w-4 h-4" />}
      footer={
        <div className="flex flex-col gap-3 w-full">
          {saveError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{saveError}</span>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending || isScheduleLoading} className="gap-2">
              {isPending ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
              ) : (
                <><Save className="w-4 h-4" />Save Schedule</>
              )}
            </Button>
          </div>
        </div>
      }
    >
      {isScheduleLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading schedule...</p>
        </div>
      )}

      {isScheduleError && !isScheduleLoading && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">Could not load existing schedule. You can create a new one below.</span>
        </div>
      )}

      {!isScheduleLoading && (
        <div className="space-y-6">
          {/* ── Global Slot Config ─────────────────────────────────────────── */}
          <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl">
            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Appointment Slot Configuration
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <LabeledField label="Slot Duration (Mins)">
                <select
                  value={settings.duration}
                  onChange={(e) => handleSettingsChange("duration", Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {[10, 15, 20, 30, 45, 60].map((v) => (
                    <option key={v} value={v}>{v} Minutes</option>
                  ))}
                </select>
              </LabeledField>
              <LabeledField label="Buffer Time (Mins)">
                <select
                  value={settings.bufferTime}
                  onChange={(e) => handleSettingsChange("bufferTime", Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {[0, 5, 10, 15].map((v) => (
                    <option key={v} value={v}>{v === 0 ? "No Buffer" : `${v} Minutes`}</option>
                  ))}
                </select>
              </LabeledField>
            </div>
            <p className="text-[10px] text-primary/60 font-medium mt-3">
              💡 Slot duration &amp; buffer apply to all days. Set "No. of Slots" per day to auto-calculate end time.
            </p>
          </div>

          {/* ── Weekly Schedule ────────────────────────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2 px-1">
              <Calendar className="w-4 h-4" /> Weekly Operating Hours
            </h3>
            <div className="space-y-3">
              {DAYS.map((day) => {
                const isWorking = schedule[day.key]?.isWorking ?? false;
                const slots     = generateTimeSlots(day.key);
                const slotCount = slotCounts[day.key] ?? slots.length;

                return (
                  <div
                    key={day.key}
                    className={`p-4 border rounded-2xl transition-all ${
                      isWorking ? "border-primary/20 bg-card" : "border-border bg-muted/20 opacity-60"
                    }`}
                  >
                    {/* Day header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] uppercase transition-colors ${isWorking ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                          {day.label.slice(0, 3)}
                        </div>
                        <h4 className="font-bold text-sm text-foreground">{day.label}</h4>
                        {isWorking && slots.length > 0 && (
                          <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {slots.length} slot{slots.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isWorking}
                          onChange={(e) => handleDayChange(day.key, "isWorking", e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary"
                        />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                          Working Day
                        </span>
                      </label>
                    </div>

                    {isWorking && (
                      <div className="space-y-3 animate-in fade-in duration-300">
                        {/* Row 1: Start / End / No. of Slots */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <LabeledField label="Start Time">
                            <HourMinPicker
                              value={schedule[day.key]?.startTime ?? ""}
                              onChange={(val) => handleStartTimeChange(day.key, val)}
                            />
                          </LabeledField>

                          <LabeledField label="End Time">
                            <HourMinPicker
                              value={schedule[day.key]?.endTime ?? ""}
                              onChange={(val) => handleEndTimeChange(day.key, val)}
                            />
                          </LabeledField>

                          <LabeledField label="No. of Slots">
                            <div className="relative flex items-center">
                              <button
                                type="button"
                                onClick={() => handleSlotCountChange(day.key, String(Math.max(1, (slotCount || 1) - 1)))}
                                className="absolute left-1.5 w-6 h-6 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors z-10 font-bold"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={slotCount || ""}
                                placeholder="10"
                                onChange={(e) => handleSlotCountChange(day.key, e.target.value)}
                                className="w-full text-center px-8 py-1.5 border-2 border-primary/30 rounded-xl text-xs font-black text-primary bg-primary/5 focus:outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSlotCountChange(day.key, String((slotCount || 1) + 1))}
                                className="absolute right-1.5 w-6 h-6 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors z-10 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </LabeledField>
                        </div>

                        {/* Row 2: Break Start / Break End */}
                        <div className="grid grid-cols-2 gap-3">
                          <LabeledField label="Break Start (optional)">
                            <HourMinPicker
                              value={schedule[day.key]?.breakStart ?? ""}
                              onChange={(val) => {
                                handleDayChange(day.key, "breakStart", val);
                                // Recompute slot count after break change
                                const day_ = schedule[day.key];
                                if (day_?.startTime && day_?.endTime) {
                                  const derived = calcSlotCount(
                                    day_.startTime, day_.endTime,
                                    val, day_.breakEnd,
                                    settings.duration, settings.bufferTime,
                                  );
                                  setSlotCounts((p) => ({ ...p, [day.key]: derived }));
                                }
                              }}
                              optional
                            />
                          </LabeledField>
                          <LabeledField label="Break End (optional)">
                            <HourMinPicker
                              value={schedule[day.key]?.breakEnd ?? ""}
                              onChange={(val) => {
                                handleDayChange(day.key, "breakEnd", val);
                                const day_ = schedule[day.key];
                                if (day_?.startTime && day_?.endTime) {
                                  const derived = calcSlotCount(
                                    day_.startTime, day_.endTime,
                                    day_.breakStart, val,
                                    settings.duration, settings.bufferTime,
                                  );
                                  setSlotCounts((p) => ({ ...p, [day.key]: derived }));
                                }
                              }}
                              optional
                            />
                          </LabeledField>
                        </div>

                        {/* Preview badges */}
                        {slots.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 items-center bg-muted/30 p-3 rounded-xl">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mr-2">
                              Slots ({slots.length}):
                            </span>
                            {(expandedDays[day.key] ? slots : slots.slice(0, 10)).map((s, i) => (
                              <Badge key={i} variant="blue" className="text-[9px] font-bold px-1.5 h-4">
                                {formatTo12Hr(s)}
                              </Badge>
                            ))}
                            {slots.length > 10 && (
                              <button
                                type="button"
                                onClick={() => setExpandedDays((prev) => ({ ...prev, [day.key]: !prev[day.key] }))}
                                className="text-[9px] font-black text-primary hover:underline cursor-pointer bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-full transition-all"
                              >
                                {expandedDays[day.key] ? "Show Less" : `+${slots.length - 10} more`}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
