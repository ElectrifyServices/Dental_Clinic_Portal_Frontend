import { useEffect, useState, useMemo } from "react";
import {
  Calendar, Clock, Plus, CheckCircle, Loader2, ChevronDown, ChevronUp,
  IndianRupee, Activity, X,
  TrendingUp, CalendarDays, Clock8, ClipboardList, UserRound,
  Stethoscope, BadgeCheck, Sparkle, Pill, Pencil, MessageSquareText, Paperclip, Upload, FileText, ExternalLink,
  Percent, AlertCircle
} from "lucide-react";
import { Modal, Button, Badge, Label, Input, Textarea, Card, MetricCard } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { PrescriptionForm } from "../Doctor/PatientConsultation/PrescriptionForm";
import { useAvailableSlotsQuery } from "../../hooks/appointments/useAvailableSlotsQuery";

import {
  useTreatmentSessionsQuery,
  useAddTreatmentSessionMutation,
  useUpdateTreatmentSessionMutation,
  useCompleteTreatmentSessionMutation,
  TreatmentSessionResponse,
  PlanPrescription,
} from "../../hooks/treatment/useTreatmentSessionHooks";
import { useTreatmentPlanQuery } from "../../hooks/treatment/useTreatmentPlanQuery";
import { useModal } from "../../contexts/ModalContext";
import { ConsultationFeedback } from "./ConsultationFeedback";

interface TreatmentSessionManagerProps {
  treatmentId: string;
  patientName: string;
  procedure: string;
  toothNumber?: number;
  doctorId?: string;
  doctorName?: string;
  onClose: () => void;
}

interface SessionScheduleDraft {
  date: string;
  time: string;
  duration: number;
}

interface InlineSessionSchedulerProps {
  doctorId?: string;
  draft: SessionScheduleDraft;
  onChange: (patch: Partial<SessionScheduleDraft>) => void;
  onCancel: () => void;
  onConfirm: () => void;
  isSaving: boolean;
}

const STATUS_CONFIG: Record<string, {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  badgeVariant: string;
  icon: any;
}> = {
  PLANNED: {
    label: "Planned",
    bgColor: "bg-slate-100/70",
    textColor: "text-slate-600",
    borderColor: "border-slate-200",
    badgeVariant: "gray",
    icon: CalendarDays,
  },
  SCHEDULED: {
    label: "Scheduled",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    badgeVariant: "amber",
    icon: CalendarDays,
  },
  IN_PROGRESS: {
    label: "In Progress",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    badgeVariant: "blue",
    icon: Activity,
  },
  COMPLETED: {
    label: "Completed",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    badgeVariant: "green",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    badgeVariant: "red",
    icon: X,
  },
};

const getTodayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
};

const convert12to24 = (time12?: string) => {
  if (!time12) return "";
  const trimmed = time12.trim();
  if (!trimmed.includes(" ")) return trimmed;

  const [timePart, modifier] = trimmed.split(" ");
  let [hours, minutes] = timePart.split(":");

  if (!hours || !minutes || !modifier) return trimmed;
  if (hours === "12") hours = "00";
  if (modifier.toUpperCase() === "PM") {
    hours = String(parseInt(hours, 10) + 12);
  }

  return `${hours.padStart(2, "0")}:${minutes}`;
};

const format24HourTime = (value: string) => {
  const match = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return value;

  const hours = parseInt(match[1], 10);
  const minutes = match[2];
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHours = hours % 12 || 12;
  return `${String(normalizedHours).padStart(2, "0")}:${minutes} ${suffix}`;
};

function InlineSessionScheduler({
  doctorId,
  draft,
  onChange,
  onCancel,
  onConfirm,
  isSaving,
}: InlineSessionSchedulerProps) {
  const { data: slotsResponse, isLoading } = useAvailableSlotsQuery(
    doctorId || null,
    draft.date || null,
  );

  const slots = useMemo(() => {
    if (!slotsResponse?.data?.slots || !draft.date) return [];

    return slotsResponse.data.slots.map((slot) => {
      const time24 = convert12to24(slot.time);
      const slotDateTime = new Date(`${draft.date}T${time24}:00`);
      const isPast =
        draft.date === getTodayInputValue() &&
        !Number.isNaN(slotDateTime.getTime()) &&
        slotDateTime.getTime() < Date.now();

      return {
        time12: slot.time,
        time24,
        appointmentCount: slot.appointment_count || 0,
        isDisabled: slot.disabled === true || isPast,
      };
    });
  }, [draft.date, slotsResponse]);

  const canConfirm = Boolean(doctorId && draft.date && draft.time);

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Calendar className="w-4 h-4 text-emerald-700" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
            Schedule Session
          </p>
          <p className="text-[11px] text-emerald-700/70">
            Choose a visit date and confirm a slot.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label className="text-[10px] font-bold text-emerald-700/70 uppercase tracking-wider mb-1.5 block">
            Date
          </Label>
          <Input
            type="date"
            value={draft.date}
            min={getTodayInputValue()}
            onChange={(e) => onChange({ date: e.target.value, time: "" })}
            className="rounded-xl border-emerald-200 bg-white"
          />
        </div>
        {/* <div>
          <Label className="text-[10px] font-bold text-emerald-700/70 uppercase tracking-wider mb-1.5 block">
            Selected Time
          </Label>
          <Input
            type="time"
            value={draft.time}
            onChange={(e) => onChange({ time: e.target.value })}
            className="rounded-xl border-emerald-200 bg-white"
          />
        </div> */}
        <div>
          <Label className="text-[10px] font-bold text-emerald-700/70 uppercase tracking-wider mb-1.5 block">
            Duration
          </Label>
          <Select
            value={String(draft.duration)}
            onValueChange={(value) => onChange({ duration: parseInt(value, 10) })}
          >
            <SelectTrigger className="rounded-xl border-emerald-200 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[15, 30, 45, 60, 90, 120].map((minutes) => (
                <SelectItem key={minutes} value={String(minutes)}>
                  {minutes} minutes
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {doctorId && draft.date ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            <p className="text-sm font-bold text-foreground">Available Slots</p>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-11 rounded-xl bg-emerald-100 animate-pulse" />
              ))}
            </div>
          ) : slots.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {slots.map((slot) => {
                const isSelected = draft.time === slot.time24;
                return (
                  <Button
                    key={slot.time24}
                    type="button"
                    disabled={slot.isDisabled}
                    onClick={() => !slot.isDisabled && onChange({ time: slot.time24 })}
                    className={[
                      "h-11 rounded-xl border text-[11px] font-bold transition-all",
                      isSelected
                        ? "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-600"
                        : slot.isDisabled
                          ? "bg-red-50 border-red-100 text-red-300 line-through cursor-not-allowed hover:bg-red-50"
                          : "bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300",
                    ].join(" ")}
                  >
                    {slot.time12} ({slot.appointmentCount})
                  </Button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No slots available for the selected date.
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Select a date to load available slots.
        </p>
      )}

      {!doctorId && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          This treatment has no linked doctor, so slots cannot be loaded.
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1 rounded-xl">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!canConfirm || isSaving}
          className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Confirm Slot
        </Button>
      </div>
    </div>
  );
}

export function TreatmentSessionManager({
  treatmentId,
  patientName,
  procedure,
  toothNumber,
  doctorId,
  doctorName,
  onClose,
}: TreatmentSessionManagerProps) {
  const { showToast } = useModal();
  const { data: treatmentPlanResponse } = useTreatmentPlanQuery(treatmentId, {
    enabled: !!treatmentId,
  });

  const { data: apiResponse, isLoading, refetch } = useTreatmentSessionsQuery(treatmentId);
  const treatmentPlan = (treatmentPlanResponse as any)?.data ?? treatmentPlanResponse;
  const assignedDoctorId =
    treatmentPlan?.doctor_id ||
    treatmentPlan?.doctor?.id ||
    doctorId;

  // ── The API wraps everything: responseObject.data.sessions[] + responseObject.data.prescriptions[]
  // useApiQuery returns the full axios/fetch response, so we unwrap accordingly.
  // Try both shapes: direct data or nested under responseObject.data
  const responseData = useMemo(() => {
    if (!apiResponse) return null;
    // Shape 1: apiResponse.data (useApiQuery strips axios wrapper → this is responseObject)
    const d = (apiResponse as any)?.data ?? apiResponse;
    // Shape 2: some interceptors return responseObject.data directly
    return d;
  }, [apiResponse]);

  const addSession = useAddTreatmentSessionMutation();
  const updateSession = useUpdateTreatmentSessionMutation();
  const completeSession = useCompleteTreatmentSessionMutation();

  const [scheduleNext, setScheduleNext] = useState(false);
  const [nextSessionDraft, setNextSessionDraft] = useState({
    date: "",
    time: "09:00 AM",
    duration: 45,
    cost: 0,
    clinical_objectives: "",
  });

  const { data: nextSlotsResponse, isLoading: isNextSlotsLoading } = useAvailableSlotsQuery(
    assignedDoctorId || null,
    nextSessionDraft.date || null,
  );

  const nextSlots = useMemo(() => {
    if (!nextSlotsResponse?.data?.slots || !nextSessionDraft.date) return [];

    return nextSlotsResponse.data.slots.map((slot: any) => {
      const time24 = convert12to24(slot.time);
      const slotDateTime = new Date(`${nextSessionDraft.date}T${time24}:00`);
      const isPast =
        nextSessionDraft.date === getTodayInputValue() &&
        !Number.isNaN(slotDateTime.getTime()) &&
        slotDateTime.getTime() < Date.now();

      return {
        time12: slot.time,
        time24,
        appointmentCount: slot.appointment_count || 0,
        isDisabled: slot.disabled === true || isPast,
      };
    });
  }, [nextSessionDraft.date, nextSlotsResponse]);

  const [showNewSession, setShowNewSession] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [editingClinicalNotes, setEditingClinicalNotes] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [showConsultationFeedback, setShowConsultationFeedback] = useState(false);
  const [schedulingSessionId, setSchedulingSessionId] = useState<string | null>(null);
  const [scheduleDraft, setScheduleDraft] = useState<SessionScheduleDraft>({
    date: "",
    time: "",
    duration: 45,
  });

  const [newSession, setNewSession] = useState({
    date: "",
    time: "09:00 AM",
    duration: 45,
    cost: 0,
    clinical_objectives: "",
  });

  const [completeForm, setCompleteForm] = useState({
    work_done: "",
    session_findings: "",
    next_session_plan: "",
    session_fee: 0,
    discount_percentage: 0,
    paid_amount: 0,
  });

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [sessionAttachments, setSessionAttachments] = useState<File[]>([]);

  const addPrescription = () => {
    setPrescriptions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        medicine: "",
        dosage: "",
        timing: "",
        frequency: "",
        duration: "",
        durationUnit: "Days",
        qty: "",
      },
    ]);
  };

  const removePrescription = (id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePrescription = (id: string, field: string, value: string) => {
    const dosageMappings: Record<string, { timing: string; frequency: string }> = {
      "1-0-0": { timing: "Before Food", frequency: "Once daily" },
      "0-1-0": { timing: "After Food", frequency: "Once daily" },
      "0-0-1": { timing: "After Food", frequency: "Once daily" },
      "1-1-0": { timing: "After Food", frequency: "Twice daily" },
      "1-0-1": { timing: "After Food", frequency: "Twice daily" },
      "0-1-1": { timing: "After Food", frequency: "Twice daily" },
      "1-1-1": { timing: "After Food", frequency: "Thrice daily" },
      "2-1-1": { timing: "After Food", frequency: "Four times daily" },
    };

    setPrescriptions((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, [field]: value };
        if (field === "dosage" && dosageMappings[value]) {
          updated.timing = dosageMappings[value].timing;
          updated.frequency = dosageMappings[value].frequency;
        }
        const parts = (updated.dosage || "").split("-");
        const dosageSum = parts.length === 3
          ? parts.reduce((s: number, x: string) => s + (parseFloat(x) || 0), 0)
          : 0;
        const durationVal = parseFloat(updated.duration) || 0;
        const multiplier = { Weeks: 7, Months: 30, Years: 365 }[updated.durationUnit as string] ?? 1;
        if (dosageSum > 0 && durationVal > 0) {
          updated.qty = String(Math.round(dosageSum * durationVal * multiplier));
        }
        return updated;
      })
    );
  };

  // ─── Derived data ──────────────────────────────────────────────────────────

  const rawSessions: TreatmentSessionResponse[] = useMemo(
    () => responseData?.sessions ?? [],
    [responseData],
  );

  // Plan-level prescriptions array → build sessionId → prescriptions[] map
  const prescriptionsBySession = useMemo(() => {
    const planRxList: PlanPrescription[] = responseData?.prescriptions ?? [];
    const map: Record<string, PlanPrescription[]> = {};
    for (const rx of planRxList) {
      if (!rx.session_id) continue;
      if (!map[rx.session_id]) map[rx.session_id] = [];
      map[rx.session_id].push(rx);
    }
    return map;
  }, [responseData]);

  // Merge plan-level prescriptions into each session object
  const sessions: TreatmentSessionResponse[] = useMemo(() => {
    return rawSessions.map((s) => ({
      ...s,
      prescriptions: (s.prescriptions?.length ? s.prescriptions : null)
        ?? prescriptionsBySession[s.id]
        ?? [],
    }));
  }, [rawSessions, prescriptionsBySession]);

  const totalSessions: number = responseData?.total ?? 0;
  const completedCount: number = responseData?.completed ?? 0;
  const totalFees: number = Number(responseData?.total_fees ?? responseData?.projected_revenue ?? 0);
  const sessionProgress = totalSessions > 0 ? (completedCount / totalSessions) * 100 : 0;

  const estCost = Number(treatmentPlan?.est_cost) || 0;
  const discountVal = Number(treatmentPlan?.discount_value) || 0;
  const discountAmt = Number(treatmentPlan?.discount_amount) || 0;
  const finalCost = Number(treatmentPlan?.final_cost) || (estCost - discountAmt);

  const rawPaidAmt = treatmentPlan?.total_paid_amount ?? treatmentPlan?.totalPaidAmount ?? treatmentPlan?.paid_amount ?? treatmentPlan?.paidAmount ?? 0;
  const paidAmt = isNaN(Number(rawPaidAmt)) ? 0 : Number(rawPaidAmt);

  const rawPendingAmt = treatmentPlan?.pending_amount ?? treatmentPlan?.pendingAmount;
  const pendingAmt = rawPendingAmt !== null && rawPendingAmt !== undefined && !isNaN(Number(rawPendingAmt))
    ? Number(rawPendingAmt)
    : Math.max(0, finalCost - paidAmt);

  const groupedSessions = useMemo(() => {
    const norm = (s?: string) => {
      const u = s?.toUpperCase().replace("-", "_") ?? "";
      return u === "PLANNED" ? "SCHEDULED" : u;
    };
    return {
      upcoming: sessions.filter(s => norm(s.status) === "SCHEDULED"),
      inProgress: sessions.filter(s => norm(s.status) === "IN_PROGRESS"),
      completed: sessions.filter(s => norm(s.status) === "COMPLETED"),
      cancelled: sessions.filter(s => norm(s.status) === "CANCELLED"),
    };
  }, [sessions]);

  const openConsultationFeedback = () => {
    if (!treatmentId) {
      showToast("Consultation feedback is not available for this treatment.", "error");
      return;
    }
    setShowConsultationFeedback(true);
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const formatDate = (d?: string) => {
    if (!d) return "Not Scheduled";
    const dateOnlyMatch = d.match(/^(\d{4}-\d{2}-\d{2})/);
    const parsed = dateOnlyMatch
      ? new Date(`${dateOnlyMatch[1]}T00:00:00`)
      : new Date(d);

    if (Number.isNaN(parsed.getTime())) return "Not Scheduled";

    return parsed.toLocaleDateString("en-IN", {
      weekday: "short", day: "2-digit", month: "2-digit", year: "numeric",
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getSessionDate = (session: TreatmentSessionResponse) =>
    session.visit_date ||
    (session as any).scheduledDate ||
    (session as any).suggestedDate;

  const formatTime = (t?: string) => {
    if (!t) return "Time Pending";
    if (t.includes("AM") || t.includes("PM")) return t;
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(t)) {
      return format24HourTime(t);
    }
    try {
      const parsed = new Date(t);
      if (Number.isNaN(parsed.getTime())) return t;
      return parsed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    } catch { return t; }
  };

  const getSessionTime = (session: TreatmentSessionResponse) => {
    const explicitTime =
      session.appointment?.start_time_ist ||
      session.appointment?.start_time ||
      session.appointment?.time ||
      session.start_time ||
      (session as any).startTime ||
      (session as any).time;

    if (explicitTime) return explicitTime;

    const sessionDate = getSessionDate(session);
    if (sessionDate?.includes("T")) return sessionDate;

    return undefined;
  };

  const toggleExpand = (id: string) =>
    setExpandedSessions(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const startSchedulingSession = (session: TreatmentSessionResponse) => {
    setSchedulingSessionId(session.id);
    setScheduleDraft({
      date: getTodayInputValue(),
      time: convert12to24(getSessionTime(session)),
      duration: session.duration_min ?? 45,
    });
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      next.add(session.id);
      return next;
    });
  };

  const cancelSchedulingSession = () => {
    setSchedulingSessionId(null);
    setScheduleDraft({ date: "", time: "", duration: 45 });
  };

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleAddSession = async () => {
    if (!newSession.date) { showToast("Please select a date", "error"); return; }
    if (newSession.cost <= 0) { showToast("Please enter a valid session fee", "error"); return; }
    try {
      await addSession.mutateAsync({
        planId: treatmentId,
        visit_date: newSession.date,
        start_time: newSession.time,
        duration_min: newSession.duration,
        session_fee: newSession.cost,
        clinical_objectives: newSession.clinical_objectives,
      });
      showToast("Session scheduled successfully!");
      setShowNewSession(false);
      setNewSession({ date: "", time: "09:00 AM", duration: 45, cost: 0, clinical_objectives: "" });
      refetch();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Failed to schedule session", "error");
    }
  };

  const handleUpdateStatus = async (
    session: TreatmentSessionResponse,
    newStatus: "PLANNED" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
  ) => {
    if (newStatus === "COMPLETED") {
      // Find the last completed session to pre-fill previous values if no fee is specified
      const completedList = sessions.filter(s => s.status?.toUpperCase() === "COMPLETED");
      const lastCompleted = completedList.length > 0
        ? [...completedList].sort((a, b) => (b.visit_number || 0) - (a.visit_number || 0))[0]
        : null;

      const fallbackFee = lastCompleted ? (Number(lastCompleted.session_fee) || 0) : 0;
      const fallbackDiscount = lastCompleted ? (Number((lastCompleted as any).discount_percentage || (lastCompleted as any).discount) || 0) : 0;
      const fallbackPaid = lastCompleted ? (Number(lastCompleted.paid_amount) || 0) : 0;

      const currentFee = Number(session.session_fee || (session as any).cost) || fallbackFee || Number(treatmentPlan?.est_cost) || Number(treatmentPlan?.cost) || 0;
      const planDiscount = Number(treatmentPlan?.discount_value) || 0;
      
      // Default to treatment plan's discount percentage first, then fallback to last completed session's discount
      const currentDiscount = planDiscount || fallbackDiscount || 0;
      const currentPaid = Number(session.paid_amount || (session as any).paidAmount) || (currentFee - (currentFee * currentDiscount) / 100);

      setCompleteForm({
        work_done: "",
        session_findings: "",
        next_session_plan: "",
        session_fee: currentFee,
        discount_percentage: currentDiscount,
        paid_amount: currentPaid,
      });
      setPrescriptions([]);
      setSessionAttachments([]);
      setScheduleNext(false);
      setNextSessionDraft({
        date: getTodayInputValue(),
        time: "", // Clear time initially to force available slot selection
        duration: 45,
        cost: currentFee, // default next session fee to this session's fee
        clinical_objectives: "",
      });
      setCompletingId(session.id);
      return;
    }
    if (newStatus === "SCHEDULED") {
      startSchedulingSession(session);
      return;
    }
    try {
      await updateSession.mutateAsync({ planId: treatmentId, sessionId: session.id, status: newStatus });
      if (schedulingSessionId === session.id) {
        cancelSchedulingSession();
      }
      showToast(`Session updated to ${STATUS_CONFIG[newStatus]?.label}`);
      refetch();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Failed to update", "error");
    }
  };

  const handleConfirmScheduledSession = async (session: TreatmentSessionResponse) => {
    if (!scheduleDraft.date) {
      showToast("Please select a date", "error");
      return;
    }
    if (!scheduleDraft.time) {
      showToast("Please select a slot", "error");
      return;
    }

    try {
      await updateSession.mutateAsync({
        planId: treatmentId,
        sessionId: session.id,
        status: "SCHEDULED",
        visit_date: scheduleDraft.date,
        start_time: scheduleDraft.time,
        duration_min: scheduleDraft.duration,
      });
      showToast("Session scheduled successfully!");
      cancelSchedulingSession();
      refetch();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Failed to schedule session", "error");
    }
  };

  const handleSessionAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setSessionAttachments((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeSessionAttachment = (index: number) => {
    setSessionAttachments((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleCompleteSession = async (sessionId: string) => {
    if (!completeForm.work_done && !completeForm.session_findings) {
      showToast("Please add work done or findings", "error");
      return;
    }
    if (scheduleNext) {
      if (!nextSessionDraft.date) {
        showToast("Please select a date for the next session", "error");
        return;
      }
      if (!nextSessionDraft.time) {
        showToast("Please select an available time slot for the next session", "error");
        return;
      }
    }
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const formattedPrescriptions = prescriptions
      .filter((p: any) => p.medicine?.trim())
      .map((p: any) => ({
        medicine_id: p.medicine,
        dosage: p.dosage,
        timing: p.timing,
        frequency: p.frequency,
        duration: parseInt(p.duration) || 1,
        duration_type: p.durationUnit?.toUpperCase() || "DAYS",
        qty: parseInt(p.qty) || 0,
      }))
      .filter((p: any) => {
        if (!UUID_REGEX.test(p.medicine_id)) {
          console.warn("Skipping prescription — medicine_id is not a UUID:", p.medicine_id);
          showToast(`Medicine "${p.medicine_id}" was not found in the system. Please re-select it.`, "error");
          return false;
        }
        return true;
      });
    try {
      let nextSessionPayload: any = {};
      if (scheduleNext && nextSessionDraft.date) {
        const formatTimeTo24h = (timeStr: string) => {
          if (!timeStr) return "10:00";
          if (!timeStr.toUpperCase().includes("AM") && !timeStr.toUpperCase().includes("PM")) {
            return timeStr.trim().substring(0, 5);
          }
          const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (match) {
            let hrs = parseInt(match[1], 10);
            const mins = match[2];
            const period = match[3].toUpperCase();
            if (period === "PM" && hrs < 12) hrs += 12;
            if (period === "AM" && hrs === 12) hrs = 0;
            return `${String(hrs).padStart(2, "0")}:${mins}`;
          }
          return timeStr.trim().substring(0, 5);
        };

        const time24 = formatTimeTo24h(nextSessionDraft.time);
        let formattedNextVisitDate = nextSessionDraft.date;
        if (nextSessionDraft.date) {
          try {
            const dateTimeStr = nextSessionDraft.date.includes("T")
              ? nextSessionDraft.date
              : `${nextSessionDraft.date}T${time24}:00`;
            const d = new Date(dateTimeStr);
            if (!isNaN(d.getTime())) {
              formattedNextVisitDate = d.toISOString();
            }
          } catch (e) {
            formattedNextVisitDate = nextSessionDraft.date;
          }
        }

        nextSessionPayload = {
          schedule_next_session: true,
          next_visit_date: formattedNextVisitDate,
          next_start_time: nextSessionDraft.time || "10:00 AM",
          next_duration_min: Number(nextSessionDraft.duration) || 60,
          next_clinical_objectives: nextSessionDraft.clinical_objectives || "",
          next_session_fee: Number(nextSessionDraft.cost) || 0,
        };
      } else {
        nextSessionPayload = {
          schedule_next_session: false,
        };
      }

      await completeSession.mutateAsync({
        planId: treatmentId,
        sessionId,
        ...completeForm,
        ...nextSessionPayload,
        prescriptions: formattedPrescriptions.length > 0 ? formattedPrescriptions : undefined,
        attachments: sessionAttachments.length > 0 ? sessionAttachments : undefined,
      });

      showToast(completedCount + 1 >= totalSessions
        ? "All sessions completed! Treatment plan done!"
        : "Session completed!");
      setCompletingId(null);
      setCompleteForm({
        work_done: "",
        session_findings: "",
        next_session_plan: "",
        session_fee: 0,
        discount_percentage: 0,
        paid_amount: 0,
      });
      setPrescriptions([]);
      setSessionAttachments([]);
      setScheduleNext(false);
      refetch();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Failed to complete", "error");
    }
  };

  useEffect(() => {
    if (
      schedulingSessionId &&
      !sessions.some((session) => session.id === schedulingSessionId)
    ) {
      cancelSchedulingSession();
    }
  }, [schedulingSessionId, sessions]);

  const handleUpdateClinicalNotes = async (sessionId: string) => {
    try {
      await updateSession.mutateAsync({ planId: treatmentId, sessionId, clinical_objectives: editNotes });
      showToast("Clinical objectives updated!");
      setEditingClinicalNotes(null);
      refetch();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Failed to update", "error");
    }
  };

  // ─── Session Card ──────────────────────────────────────────────────────────

  const renderSessionCard = (session: TreatmentSessionResponse) => {
    const normalizedStatus = session.status?.toUpperCase().replace("-", "_") || "PLANNED";
    const cfg = STATUS_CONFIG[normalizedStatus] ?? STATUS_CONFIG.SCHEDULED;
    const StatusIcon = cfg.icon;
    const isCompleting = completingId === session.id;
    const isExpanded = expandedSessions.has(session.id);
    const isEditing = editingClinicalNotes === session.id;
    const isScheduling = schedulingSessionId === session.id;
    const appointmentTime = formatTime(getSessionTime(session));

    // Prescriptions already merged in sessions useMemo
    const sessionRx: PlanPrescription[] = (session.prescriptions as PlanPrescription[]) ?? [];

    return (
      <div className="relative" key={session.id}>
        <Card className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${cfg.borderColor} ${normalizedStatus === "IN_PROGRESS" ? "shadow-lg shadow-blue-100" : "hover:shadow-md"
          }`}>
          {/* ── Card Header ── */}
          <div className="p-5 cursor-pointer hover:bg-muted/5 transition-colors" onClick={() => toggleExpand(session.id)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bgColor} flex items-center justify-center`}>
                    <StatusIcon className={`w-5 h-5 ${cfg.textColor}`} />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground">Session {session.visit_number}</h4>
                    <p className="text-xs text-muted-foreground">{formatDate(getSessionDate(session))}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{appointmentTime} • {session.duration_min ?? 45} min</span>
                  </div>

                  {normalizedStatus === "COMPLETED" && (

                    <div className="flex items-center gap-2 text-muted-foreground">

                      Clinical Objectives :
                      <span className="truncate text-xs">{session.clinical_objectives || "No objectives set"}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {normalizedStatus === "SCHEDULED" && !isScheduling && (
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      startSchedulingSession(session);
                    }}
                    className="h-9 w-9 rounded-xl border-amber-200 bg-amber-50 p-0 text-amber-700 hover:bg-amber-100"
                    title="Reschedule session"
                    aria-label="Reschedule session"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
                {normalizedStatus !== "COMPLETED" && normalizedStatus !== "CANCELLED" && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={normalizedStatus}
                      onValueChange={(val) => handleUpdateStatus(session, val as any)}
                      disabled={updateSession.isPending}
                    >
                      <SelectTrigger className={`text-[10px] h-auto font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border cursor-pointer outline-none focus:ring-2 transition-all ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLANNED">Planned</SelectItem>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Complete</SelectItem>
                        <SelectItem value="CANCELLED">Cancel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {isExpanded
                  ? <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </div>
            </div>
          </div>

          {/* ── Expanded Content ── */}
          {isExpanded && (
            <div className="border-t p-5 bg-muted/10 space-y-4">
              {isScheduling && (
                <InlineSessionScheduler
                  doctorId={assignedDoctorId || session.plan?.doctor?.id}
                  draft={scheduleDraft}
                  onChange={(patch) =>
                    setScheduleDraft((prev) => ({ ...prev, ...patch }))
                  }
                  onCancel={cancelSchedulingSession}
                  onConfirm={() => handleConfirmScheduledSession(session)}
                  isSaving={updateSession.isPending}
                />
              )}

              {/* Clinical objectives */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList className="w-3 h-3" /> Clinical Objectives
                  </p>
                  {!isEditing && normalizedStatus !== "COMPLETED" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => { e.stopPropagation(); setEditingClinicalNotes(session.id); setEditNotes(session.clinical_objectives ?? ""); }}
                      className="h-8 rounded-lg border-primary bg-primary px-3 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
                    >
                      Edit
                    </Button>
                  )}
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-primary/20 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                      placeholder="Clinical objectives..."
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" onClick={() => setEditingClinicalNotes(null)} className="text-xs px-3 py-1 rounded-lg bg-muted hover:bg-muted/80 h-auto">Cancel</Button>
                      <Button onClick={() => handleUpdateClinicalNotes(session.id)} className="text-xs px-3 py-1 rounded-lg bg-primary text-white hover:bg-primary/90">Save</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-foreground leading-relaxed">
                    {session.clinical_objectives || "No clinical objectives specified."}
                  </p>
                )}
              </div>

              {/* Work done */}
              {session.work_done && (
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <BadgeCheck className="w-3 h-3" /> Work Performed
                  </p>
                  <p className="text-sm leading-relaxed">{session.work_done}</p>
                </div>
              )}
              {normalizedStatus === "COMPLETED" && (
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <IndianRupee className="w-3 h-3" /> Paid Amount
                  </p>
                  <p className="text-sm leading-relaxed font-semibold">
                    {session.paid_amount != null && Number(session.paid_amount) > 0
                      ? "\u20B9" + Number(session.paid_amount).toLocaleString("en-IN")
                      : "NA"}
                  </p>
                </div>
              )}

              {/* Clinical findings */}
              {session.session_findings && (
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Stethoscope className="w-3 h-3" /> Clinical Findings
                  </p>
                  <p className="text-sm leading-relaxed">{session.session_findings}</p>
                </div>
              )}

              {/* Next session plan */}
              {session.next_session_plan && (
                <div>
                  <p className="text-[10px] font-black text-purple-600 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Sparkle className="w-3 h-3" /> Next Session Plan
                  </p>
                  <p className="text-sm leading-relaxed">{session.next_session_plan}</p>
                </div>
              )}

              {session.attachments?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Paperclip className="w-3 h-3" /> Attachments
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {session.attachments.map((attachment) => {
                      const fileSize = formatFileSize(Number(attachment.file_size));
                      const fileMeta = [fileSize, attachment.file_type || attachment.file_extension]
                        .filter(Boolean)
                        .join(" | ");

                      return (
                        <a
                          key={attachment.id || attachment.file_url}
                          href={attachment.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-3 py-2 transition-colors hover:border-emerald-300 hover:bg-emerald-50/60"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                            <FileText className="w-4 h-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-foreground">
                              {attachment.file_name || "Attachment"}
                            </span>
                            {fileMeta && (
                              <span className="block text-[11px] font-semibold text-muted-foreground">
                                {fileMeta}
                              </span>
                            )}
                          </span>
                          <ExternalLink className="w-4 h-4 shrink-0 text-muted-foreground" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Prescribed Medicines ── */}
              {sessionRx.length > 0 && (
                <div className="border border-border/50 rounded-xl overflow-hidden">
                  <div className="bg-violet-50 px-4 py-2.5 border-b border-border/50 flex items-center gap-2">
                    <Pill className="w-3.5 h-3.5 text-violet-600" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-violet-700">
                      Prescribed Medicines
                    </span>
                    <span className="ml-auto text-[10px] font-bold text-violet-500 bg-violet-100 px-2 py-0.5 rounded-full">
                      {sessionRx.length}
                    </span>
                  </div>
                  <div className="divide-y divide-border/50 bg-card">
                    {sessionRx.map((rx, i) => {
                      const name =
                        rx.medicine?.name ||
                        rx.medicine_name ||
                        rx.medicineName ||
                        "Unknown Medicine";
                      return (
                        <div key={rx.id || i} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
                          {/* Left: name + dosage badge */}
                          <div className="flex items-center gap-2 flex-1 flex-wrap">
                            <Pill className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                            <span className="text-sm font-bold text-foreground">{name}</span>
                            {rx.dosage && (
                              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                {rx.dosage}
                              </span>
                            )}
                          </div>
                          {/* Right: meta info */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            {rx.timing && (
                              <span className="flex items-center gap-1">
                                🕐 {rx.timing}
                              </span>
                            )}
                            {rx.frequency && (
                              <span className="flex items-center gap-1">
                                🔁 {rx.frequency}
                              </span>
                            )}
                            {rx.duration != null && (
                              <span>
                                📅 {rx.duration} {rx.duration_type ?? "Days"}
                              </span>
                            )}
                            {rx.qty != null && (
                              <span className="font-semibold text-foreground">
                                Qty: {rx.qty}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Appointment link */}
              {session.appointment_id && (
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Appointment linked:</span>
                  <span className="text-[9px] font-mono text-primary/60">{session.appointment_id.slice(-8).toUpperCase()}</span>
                  {session.appointment && (
                    <span className="text-[9px] text-muted-foreground/50 ml-2">({session.appointment.status})</span>
                  )}
                </div>
              )}

              {/* Completed at */}
              {session.completed_at && (
                <div className="pt-1 text-right">
                  <span className="text-[9px] text-muted-foreground/50">
                    Completed {new Date(session.completed_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ── Complete Session Modal ── */}
        {isCompleting && (
          <Modal
            title={`Complete Session ${session.visit_number}`}
            subtitle="Record what was done today"
            onClose={() => setCompletingId(null)}
            size="5xl"
            icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
            footer={
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCompletingId(null);
                    setSessionAttachments([]);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleCompleteSession(session.id)}
                  disabled={
                    completeSession.isPending ||
                    (!completeForm.work_done && !completeForm.session_findings)
                  }
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2 text-white"
                >
                  {completeSession.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle className="w-4 h-4" />}
                  Complete Session
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold block mb-2">Work Done <span className="text-red-500">*</span></Label>
                <Textarea rows={3} placeholder="Describe the procedures performed..." value={completeForm.work_done}
                  onChange={(e) => setCompleteForm(p => ({ ...p, work_done: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none resize-none" />
              </div>
              <div>
                <Label className="text-sm font-semibold block mb-2">Clinical Findings <span className="text-red-500">*</span></Label>
                <Textarea rows={3} placeholder="Observations, measurements, patient response..." value={completeForm.session_findings}
                  onChange={(e) => setCompleteForm(p => ({ ...p, session_findings: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-4">
                <div>
                  <Label className="text-sm font-semibold block mb-2">Total Cost (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Total Cost"
                    value={completeForm.session_fee || ""}
                    onChange={(e) => {
                      const cost = parseInt(e.target.value) || 0;
                      setCompleteForm(p => {
                        const discountAmt = (cost * p.discount_percentage) / 100;
                        const net = Math.max(0, cost - discountAmt);
                        return { ...p, session_fee: cost, paid_amount: net };
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none font-semibold"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold block mb-2">Discount (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Discount %"
                    value={completeForm.discount_percentage || ""}
                    onChange={(e) => {
                      const pct = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                      setCompleteForm(p => {
                        const discountAmt = (p.session_fee * pct) / 100;
                        const net = Math.max(0, p.session_fee - discountAmt);
                        return { ...p, discount_percentage: pct, paid_amount: net };
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none font-semibold"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold block mb-2">Paid Amount (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Paid Amount"
                    value={completeForm.paid_amount || ""}
                    onChange={(e) => setCompleteForm(p => ({ ...p, paid_amount: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none font-semibold text-emerald-700 bg-emerald-50/30"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold block mb-2">Pending Amount (₹)</Label>
                  <Input
                    type="number"
                    disabled
                    placeholder="Pending Amount"
                    value={Math.max(0, completeForm.session_fee - (completeForm.session_fee * completeForm.discount_percentage) / 100 - completeForm.paid_amount)}
                    className="w-full px-3 py-2 rounded-xl border bg-slate-50 font-bold text-red-600 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="schedule-next-session"
                    checked={scheduleNext}
                    onChange={(e) => setScheduleNext(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-border rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <Label htmlFor="schedule-next-session" className="text-sm font-bold text-muted-foreground cursor-pointer">
                    Schedule Next Session (Optional)
                  </Label>
                </div>

                {scheduleNext && (
                  <div className="bg-muted/30 p-4 rounded-2xl border border-border space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold block mb-2">Next Session Date</Label>
                        <Input
                          type="date"
                          min={(() => {
                            const today = new Date();
                            const year = today.getFullYear();
                            const month = String(today.getMonth() + 1).padStart(2, "0");
                            const day = String(today.getDate()).padStart(2, "0");
                            return `${year}-${month}-${day}`;
                          })()}
                          value={nextSessionDraft.date}
                          onChange={(e) => setNextSessionDraft(p => ({ ...p, date: e.target.value, time: "" }))}
                          className="w-full !inline-flex items-center justify-between px-3 py-1.5 text-sm rounded-xl border focus:ring-2 focus:ring-emerald-200 bg-white font-medium cursor-pointer [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                      </div>

                      {/* Time and Session Fee commented out per requirements */}
                      {/* 
                      <div>
                        <Label className="text-xs font-semibold block mb-2">Time</Label>
                        <Select
                          value={nextSessionDraft.time || "10:00 AM"}
                          onValueChange={(val) => setNextSessionDraft(p => ({ ...p, time: val }))}
                        >
                          <SelectTrigger className="w-full px-3 py-1.5 text-sm rounded-xl border focus:ring-2 focus:ring-emerald-200 bg-white font-medium">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
                              "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
                              "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
                              "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
                              "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
                              "07:00 PM", "07:30 PM", "08:00 PM"
                            ].map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      */}

                      <div>
                        <Label className="text-xs font-semibold block mb-2">Duration (Min)</Label>
                        <Select
                          value={String(nextSessionDraft.duration || 45)}
                          onValueChange={(val) => setNextSessionDraft(p => ({ ...p, duration: parseInt(val) || 45 }))}
                        >
                          <SelectTrigger className="w-full px-3 py-1.5 text-sm rounded-xl border focus:ring-2 focus:ring-emerald-200 bg-white font-medium">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            {[15, 30, 45, 60, 90, 120].map((d) => (
                              <SelectItem key={d} value={d.toString()}>{d} minutes</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/*
                      <div>
                        <Label className="text-xs font-semibold block mb-2">Session Fee (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={nextSessionDraft.cost}
                          onChange={(e) => setNextSessionDraft(p => ({ ...p, cost: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-1.5 text-sm rounded-xl border focus:ring-2 focus:ring-emerald-200 bg-white font-medium"
                        />
                      </div>
                      */}
                    </div>

                    {/* Available Slots Selection for Next Session */}
                    {assignedDoctorId && nextSessionDraft.date ? (
                      <div className="space-y-3 border-t pt-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-700" />
                          <p className="text-xs font-bold text-foreground">Available Slots</p>
                          {isNextSlotsLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />}
                        </div>

                        {isNextSlotsLoading ? (
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {Array.from({ length: 6 }).map((_, index) => (
                              <div key={index} className="h-10 rounded-xl bg-emerald-100/50 animate-pulse" />
                            ))}
                          </div>
                        ) : nextSlots.length > 0 ? (
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                            {nextSlots.map((slot) => {
                              const isSelected = nextSessionDraft.time === slot.time12;
                              return (
                                <button
                                  key={slot.time24}
                                  type="button"
                                  disabled={slot.isDisabled}
                                  onClick={() => !slot.isDisabled && setNextSessionDraft(p => ({ ...p, time: slot.time12 }))}
                                  className={[
                                    "h-10 rounded-xl border text-[11px] font-bold transition-all px-2 py-1",
                                    isSelected
                                      ? "bg-emerald-600 border-emerald-600 text-white"
                                      : slot.isDisabled
                                        ? "bg-red-50 border-red-100 text-red-300 line-through cursor-not-allowed"
                                        : "bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300",
                                  ].join(" ")}
                                >
                                  {slot.time12} ({slot.appointmentCount})
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            No slots available for the selected date.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground border-t pt-4">
                        Select a date to load available slots.
                      </p>
                    )}

                    {!assignedDoctorId && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                        This treatment has no linked doctor, so slots cannot be loaded.
                      </p>
                    )}

                    <div>
                      <Label className="text-xs font-semibold block mb-2">Clinical Objectives / Next Session Plan</Label>
                      <Textarea
                        rows={2}
                        placeholder="Next session targets..."
                        value={nextSessionDraft.clinical_objectives}
                        onChange={(e) => setNextSessionDraft(p => ({ ...p, clinical_objectives: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-200 bg-white resize-none font-medium text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-emerald-600" />
                  <Label className="text-sm font-semibold">Attachments</Label>
                </div>
                <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-4">
                  <Input
                    id={`session-attachments-${session.id}`}
                    type="file"
                    multiple
                    onChange={handleSessionAttachmentUpload}
                    className="hidden"
                  />
                  <Label
                    htmlFor={`session-attachments-${session.id}`}
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-white px-4 py-5 text-center transition-colors hover:bg-emerald-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Upload files</p>
                      <p className="text-xs text-muted-foreground">
                        Select one or more files to attach with this completed session
                      </p>
                    </div>
                  </Label>

                  {sessionAttachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {sessionAttachments.map((file, index) => (
                        <div
                          key={`${file.name}-${file.size}-${index}`}
                          className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white px-3 py-2"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{file.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {file.size >= 1024 * 1024
                                ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
                                : `${Math.max(1, Math.round(file.size / 1024))} KB`}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeSessionAttachment(index)}
                            className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t pt-4">
                <PrescriptionForm
                  prescriptions={prescriptions}
                  onAddPrescription={addPrescription}
                  onRemovePrescription={removePrescription}
                  onUpdatePrescription={updatePrescription}
                />
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  };

  // ─── Main Render ───────────────────────────────────────────────────────────

  return (
    <Modal
      title="Treatment Session"
      subtitle={`${patientName} ${procedure}${toothNumber ? ` • ${String(toothNumber) === "-1" || String(toothNumber).toUpperCase() === "FM" ? "FM (Full Mouth)" : `Tooth #${toothNumber}`}` : ""}`}
      onClose={onClose}
      size="5xl"
      icon={<Calendar className="w-5 h-5" />}
      bodyClassName="flex min-h-0 flex-col overflow-hidden"
    >
      <div className="flex flex-1 min-h-0 flex-col gap-8 overflow-hidden">

        {/* Stats */}
        <div className="space-y-3 shrink-0">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard
              label="Total Sessions"
              value={totalSessions}
              icon={<Calendar className="w-5 h-5 text-primary" />}
              variant="primary"
              interactive={false}
            />
            <MetricCard
              label="Completed"
              value={completedCount}
              icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
              variant="emerald"
              interactive={false}
            />
            <MetricCard
              label="In Progress"
              value={groupedSessions.inProgress.length}
              icon={<Activity className="w-5 h-5 text-rose-600" />}
              variant="rose"
              interactive={false}
            />
            <MetricCard
              label="Estimated Cost"
              value={`₹${totalFees.toLocaleString("en-IN")}`}
              icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
              variant="indigo"
              interactive={false}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard
              label="Discount"
              value={discountVal > 0 ? `${discountVal}%` : "0%"}
              icon={<Percent className="w-5 h-5 text-amber-500" />}
              variant="amber"
              interactive={false}
            />
            <MetricCard
              label="Total Paid"
              value={`₹${paidAmt.toLocaleString("en-IN")}`}
              icon={<BadgeCheck className="w-5 h-5 text-emerald-500" />}
              variant="emerald"
              interactive={false}
            />
            <MetricCard
              label="Pending Amount"
              value={`₹${pendingAmt.toLocaleString("en-IN")}`}
              icon={<AlertCircle className="w-5 h-5 text-red-500" />}
              variant="rose"
              interactive={false}
            />
          </div>
        </div>

        {/* Timeline header */}
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock8 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-black text-lg">Session Timeline</h3>
              {doctorName && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <UserRound className="w-3 h-3" /> {doctorName}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              onClick={openConsultationFeedback}
              className="gap-2"
            >
              <MessageSquareText className="w-4 h-4" /> Consultation Feedback
            </Button>
            {/* 
            <Button onClick={() => setShowNewSession(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Add Session
            </Button>
            */}
          </div>
        </div>

        {/* Sessions list */}
        <div className="min-h-0 flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex h-full items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : sessions.length > 0 ? (
            <div className="h-full max-h-[calc(100vh-23rem)] overflow-y-auto pr-1 custom-scrollbar">
              <div className="space-y-6">
                {groupedSessions.inProgress.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" /> In Progress ({groupedSessions.inProgress.length})
                    </h4>
                    <div className="space-y-3">{groupedSessions.inProgress.map(renderSessionCard)}</div>
                  </div>
                )}
                {groupedSessions.upcoming.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" /> Upcoming ({groupedSessions.upcoming.length})
                    </h4>
                    <div className="space-y-3">{groupedSessions.upcoming.map(renderSessionCard)}</div>
                  </div>
                )}
                {groupedSessions.completed.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> Completed ({groupedSessions.completed.length})
                    </h4>
                    <div className="space-y-3">{groupedSessions.completed.map(renderSessionCard)}</div>
                  </div>
                )}
                {groupedSessions.cancelled.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" /> Cancelled ({groupedSessions.cancelled.length})
                    </h4>
                    <div className="space-y-3">{groupedSessions.cancelled.map(renderSessionCard)}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center py-16 bg-muted/20 rounded-2xl border-2 border-dashed w-full">
                <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-semibold text-muted-foreground">No Sessions Scheduled</h3>
                <p className="text-sm text-muted-foreground/60 mt-1">Click "Add Session" to create the first session</p>
              </div>
            </div>
          )}
        </div>

        {/* Add session modal */}
        {showNewSession && (
          <Modal
            title="Schedule New Session"
            subtitle="Add details for the upcoming appointment"
            onClose={() => setShowNewSession(false)}
            size="2xl"
            icon={<Plus className="w-5 h-5" />}
            footer={
              <div className="flex gap-3 w-full">
                <Button variant="outline" onClick={() => setShowNewSession(false)} className="flex-1">Cancel</Button>
                <Button onClick={handleAddSession} disabled={!newSession.date || !newSession.cost || addSession.isPending} className="flex-1 gap-2">
                  {addSession.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Schedule Session
                </Button>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-sm font-semibold block mb-2">Visit Date <span className="text-red-500">*</span></Label>
                <Input type="date" value={newSession.date}
                  onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <Label className="text-sm font-semibold block mb-2">Start Time</Label>
                <Select value={newSession.time} onValueChange={(val) => setNewSession({ ...newSession, time: val })}>
                  <SelectTrigger className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["09:00 AM", "10:00 AM", "11:00 AM", "11:30 AM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"].map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold block mb-2">Duration (minutes)</Label>
                <Select value={newSession.duration.toString()} onValueChange={(val) => setNewSession({ ...newSession, duration: parseInt(val) })}>
                  <SelectTrigger className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[15, 30, 45, 60, 90, 120].map(d => <SelectItem key={d} value={d.toString()}>{d} minutes</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold block mb-2">Session Fee (₹)</Label>
                <Input type="number" value={newSession.cost || ""} min="0" step="500" placeholder="Enter amount"
                  onChange={(e) => setNewSession({ ...newSession, cost: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
            </div>
            <div className="mb-6">
              <Label className="text-sm font-semibold block mb-2">Clinical Objectives</Label>
              <Textarea value={newSession.clinical_objectives} rows={3}
                onChange={(e) => setNewSession({ ...newSession, clinical_objectives: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                placeholder="Describe the goals for this session..." />
            </div>
          </Modal>
        )}

        {showConsultationFeedback && (
          <ConsultationFeedback
            treatmentId={treatmentId}
            patientName={patientName}
            onClose={() => setShowConsultationFeedback(false)}
          />
        )}

      </div>
    </Modal>
  );
}
