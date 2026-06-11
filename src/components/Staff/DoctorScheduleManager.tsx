import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { useState, useEffect } from "react";
import { Save, Clock, Calendar, AlertTriangle, Loader2 } from "lucide-react";
import { Modal, Button, LabeledField, Badge, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";
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
      <Select value={hStr || "empty"} onValueChange={handleHourChange}>
        <SelectTrigger className="w-[60%] px-1.5 py-1.5 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none bg-card h-9">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent className="max-h-56">
          <SelectItem value="empty">Hour</SelectItem>
          {hours.map((h) => (
            <SelectItem key={h.val} value={h.val}>
              {h.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground font-black text-xs">:</span>
      <Select value={mStr || "empty"} onValueChange={handleMinChange} disabled={!hStr}>
        <SelectTrigger className="w-[40%] px-1.5 py-1.5 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none bg-card disabled:opacity-50 h-9">
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent className="max-h-56">
          <SelectItem value="empty">Min</SelectItem>
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
      }
    }
    
    // Always mark as initialized after the first complete fetch/cache hit
    setInitialized(true);
  }, [apiScheduleData, initialized, isFetching, isScheduleLoading, isScheduleError]);

  // ── Save mutation ─────────────────────────────────────────────────────────
  const { mutateAsync: createSchedule, isPending } =
    useCreateDoctorScheduleMutation();

  // ── Start time handler ──
  const handleStartTimeChange = (dayKey: string, newStart: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], startTime: newStart },
    }));
  };

  // ── End time handler ──
  const handleEndTimeChange = (dayKey: string, newEnd: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], endTime: newEnd },
    }));
  };

  // ── When global settings change ──
  const handleSettingsChange = (field: "duration" | "bufferTime", value: number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
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
      // Skip break window if the slot overlaps/intersects with it
      if (bS !== null && bE !== null && cur < bE && cur + settings.duration > bS) {
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
                <Select
                  value={String(settings.duration)}
                  onValueChange={(val) => handleSettingsChange("duration", Number(val))}
                >
                  <SelectTrigger className="w-full px-4 py-2 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none h-10 bg-card">
                    <SelectValue placeholder="Select Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 15, 20, 30, 45, 60].map((v) => (
                      <SelectItem key={v} value={String(v)}>{v} Minutes</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </LabeledField>
              <LabeledField label="Buffer Time (Mins)">
                <Select
                  value={String(settings.bufferTime)}
                  onValueChange={(val) => handleSettingsChange("bufferTime", Number(val))}
                >
                  <SelectTrigger className="w-full px-4 py-2 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none h-10 bg-card">
                    <SelectValue placeholder="Select Buffer" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 5, 10, 15].map((v) => (
                      <SelectItem key={v} value={String(v)}>{v === 0 ? "No Buffer" : `${v} Minutes`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </LabeledField>
            </div>
            <p className="text-[10px] text-primary/60 font-medium mt-3">
              💡 Slot duration &amp; buffer apply to all days. Slots are automatically calculated based on operating hours and breaks.
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
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <Input
                          type="checkbox"
                          checked={isWorking}
                          onChange={(e) => handleDayChange(day.key, "isWorking", e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary"
                        />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                          Working Day
                        </span>
                      </Label>
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

                          <LabeledField label="Calculated Slots">
                            <div className="w-full text-center px-4 py-1.5 border border-border rounded-xl text-xs font-black text-primary bg-primary/5 h-9 flex items-center justify-center">
                              {slots.length} Slot{slots.length !== 1 ? 's' : ''}
                            </div>
                          </LabeledField>
                        </div>

                        {/* Row 2: Break Start / Break End */}
                        <div className="grid grid-cols-2 gap-3">
                          <LabeledField label="Break Start (optional)">
                            <HourMinPicker
                              value={schedule[day.key]?.breakStart ?? ""}
                              onChange={(val) => handleDayChange(day.key, "breakStart", val)}
                              optional
                            />
                          </LabeledField>
                          <LabeledField label="Break End (optional)">
                            <HourMinPicker
                              value={schedule[day.key]?.breakEnd ?? ""}
                              onChange={(val) => handleDayChange(day.key, "breakEnd", val)}
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
                              <Button
                                type="button"
                                onClick={() => setExpandedDays((prev) => ({ ...prev, [day.key]: !prev[day.key] }))}
                                className="text-[9px] font-black text-primary hover:underline cursor-pointer bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-full transition-all"
                              >
                                {expandedDays[day.key] ? "Show Less" : `+${slots.length - 10} more`}
                              </Button>
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
