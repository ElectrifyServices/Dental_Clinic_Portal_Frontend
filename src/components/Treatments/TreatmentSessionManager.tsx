import { useState, useMemo } from "react";
import {
  Calendar, Clock, Plus, CheckCircle, Loader2, ChevronDown, ChevronUp,
  IndianRupee, Activity, X,
  TrendingUp, CalendarDays, Clock8, ClipboardList, UserRound,
  Stethoscope, BadgeCheck, Sparkle, Sparkles, Pill,
} from "lucide-react";
import { Modal, Button, Badge, Label, Input, Textarea, Card, MetricCard } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { PrescriptionForm } from "../Doctor/PatientConsultation/PrescriptionForm";

import {
  useTreatmentSessionsQuery,
  useAddTreatmentSessionMutation,
  useUpdateTreatmentSessionMutation,
  useCompleteTreatmentSessionMutation,
  TreatmentSessionResponse,
  PlanPrescription,
} from "../../hooks/treatment/useTreatmentSessionHooks";
import { useModal } from "../../contexts/ModalContext";

interface TreatmentSessionManagerProps {
  treatmentId: string;
  patientName: string;
  procedure: string;
  toothNumber?: number;
  doctorName?: string;
  onClose: () => void;
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

export function TreatmentSessionManager({
  treatmentId,
  patientName,
  procedure,
  toothNumber,
  doctorName,
  onClose,
}: TreatmentSessionManagerProps) {
  const { showToast } = useModal();

  const { data: apiResponse, isLoading, refetch } = useTreatmentSessionsQuery(treatmentId);

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

  const [showNewSession, setShowNewSession] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [editingClinicalNotes, setEditingClinicalNotes] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");

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
  });

  const [prescriptions, setPrescriptions] = useState<any[]>([]);

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

  const totalSessions: number   = responseData?.total ?? 0;
  const completedCount: number  = responseData?.completed ?? 0;
  const projectedRevenue: number = responseData?.projected_revenue ?? 0;
  const sessionProgress = totalSessions > 0 ? (completedCount / totalSessions) * 100 : 0;

  const groupedSessions = useMemo(() => {
    const norm = (s?: string) => {
      const u = s?.toUpperCase().replace("-", "_") ?? "";
      return u === "PLANNED" ? "SCHEDULED" : u;
    };
    return {
      upcoming:   sessions.filter(s => norm(s.status) === "SCHEDULED"),
      inProgress: sessions.filter(s => norm(s.status) === "IN_PROGRESS"),
      completed:  sessions.filter(s => norm(s.status) === "COMPLETED"),
      cancelled:  sessions.filter(s => norm(s.status) === "CANCELLED"),
    };
  }, [sessions]);

  const currentSession = sessions.find(s =>
    s.status?.toUpperCase().replace("-", "_") === "IN_PROGRESS"
  );

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const formatDate = (d?: string) => {
    if (!d) return "Date TBD";
    return new Date(d).toLocaleDateString("en-IN", {
      weekday: "short", day: "2-digit", month: "short", year: "numeric",
    });
  };

  const formatTime = (t?: string) => {
    if (!t) return "TBD";
    if (t.includes("AM") || t.includes("PM")) return t;
    try {
      return new Date(t).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    } catch { return t; }
  };

  const toggleExpand = (id: string) =>
    setExpandedSessions(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

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
    sessionId: string,
    newStatus: "PLANNED" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
  ) => {
    if (newStatus === "COMPLETED") {
      setCompleteForm({ work_done: "", session_findings: "", next_session_plan: "" });
      setPrescriptions([]);
      setCompletingId(sessionId);
      return;
    }
    try {
      await updateSession.mutateAsync({ planId: treatmentId, sessionId, status: newStatus });
      showToast(`Session updated to ${STATUS_CONFIG[newStatus]?.label}`);
      refetch();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Failed to update", "error");
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    if (!completeForm.work_done && !completeForm.session_findings) {
      showToast("Please add work done or findings", "error");
      return;
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
      await completeSession.mutateAsync({
        planId: treatmentId,
        sessionId,
        ...completeForm,
        prescriptions: formattedPrescriptions.length > 0 ? formattedPrescriptions : undefined,
      });
      showToast(completedCount + 1 >= totalSessions
        ? "All sessions completed! Treatment plan done!"
        : "Session completed!");
      setCompletingId(null);
      setCompleteForm({ work_done: "", session_findings: "", next_session_plan: "" });
      setPrescriptions([]);
      refetch();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Failed to complete", "error");
    }
  };

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
    const isCompleting  = completingId === session.id;
    const isExpanded    = expandedSessions.has(session.id);
    const isEditing     = editingClinicalNotes === session.id;
    const appointmentTime = session.appointment?.start_time
      ? formatTime(session.appointment.start_time)
      : formatTime(session.start_time);

    // Prescriptions already merged in sessions useMemo
    const sessionRx: PlanPrescription[] = (session.prescriptions as PlanPrescription[]) ?? [];

    return (
      <div className="relative" key={session.id}>
        <Card className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${cfg.borderColor} ${
          normalizedStatus === "IN_PROGRESS" ? "shadow-lg shadow-blue-100" : "hover:shadow-md"
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
                    <p className="text-xs text-muted-foreground">{formatDate(session.visit_date)}</p>
                  </div>
                  <Badge variant={cfg.badgeVariant as any} className="ml-auto">{cfg.label}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{appointmentTime || "TBD"} • {session.duration_min ?? 45} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IndianRupee className="w-4 h-4" />
                    <span className="font-medium">₹{Number(session.session_fee).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ClipboardList className="w-4 h-4" />
                    <span className="truncate text-xs">{session.clinical_objectives || "No objectives set"}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {normalizedStatus !== "COMPLETED" && normalizedStatus !== "CANCELLED" && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={normalizedStatus}
                      onValueChange={(val) => handleUpdateStatus(session.id, val as any)}
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

              {/* Clinical objectives */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList className="w-3 h-3" /> Clinical Objectives
                  </p>
                  {!isEditing && normalizedStatus !== "COMPLETED" && (
                    <Button
                      onClick={(e) => { e.stopPropagation(); setEditingClinicalNotes(session.id); setEditNotes(session.clinical_objectives ?? ""); }}
                      className="text-[10px] font-semibold text-primary hover:underline"
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
                <Button variant="outline" onClick={() => setCompletingId(null)} className="flex-1">Cancel</Button>
                <Button
                  onClick={() => handleCompleteSession(session.id)}
                  disabled={completeSession.isPending || (!completeForm.work_done && !completeForm.session_findings)}
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
                  className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none resize-none" autoFocus />
              </div>
              <div>
                <Label className="text-sm font-semibold block mb-2">Clinical Findings <span className="text-red-500">*</span></Label>
                <Textarea rows={3} placeholder="Observations, measurements, patient response..." value={completeForm.session_findings}
                  onChange={(e) => setCompleteForm(p => ({ ...p, session_findings: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none resize-none" />
              </div>
              <div>
                <Label className="text-sm font-semibold block mb-2">Next Session Plan</Label>
                <Textarea rows={2} placeholder="Recommended follow-up..." value={completeForm.next_session_plan}
                  onChange={(e) => setCompleteForm(p => ({ ...p, next_session_plan: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none resize-none" />
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
      title="Treatment Sessions"
      subtitle={`${patientName} • ${procedure}${toothNumber ? ` • Tooth #${toothNumber}` : ""}`}
      onClose={onClose}
      size="5xl"
      icon={<Calendar className="w-5 h-5" />}
      footer={<div className="flex justify-end w-full"><Button variant="outline" onClick={onClose}>Close</Button></div>}
    >
      <div className="space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Sessions"
            value={totalSessions}
            icon={<Calendar className="w-5 h-5 text-primary" />}
            variant="primary"
          />
          <MetricCard
            label="Completed"
            value={completedCount}
            icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
            variant="emerald"
            trend={totalSessions > 0 ? `${Math.round(sessionProgress)}%` : undefined}
          />
          <MetricCard
            label="Projected Revenue"
            value={`₹${Number(projectedRevenue).toLocaleString()}`}
            icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
            variant="indigo"
          />
          <MetricCard
            label="In Progress"
            value={groupedSessions.inProgress.length}
            icon={<Activity className="w-5 h-5 text-rose-600" />}
            variant="rose"
          />
        </div>

        {/* Active session banner */}
        {currentSession && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-black text-blue-700 uppercase tracking-wider">Currently Active Session</span>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-black text-lg">Session {currentSession.visit_number}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(currentSession.visit_date)} at {formatTime(currentSession.start_time)}
                </p>
              </div>
              <Button onClick={() => handleUpdateStatus(currentSession.id, "COMPLETED")} className="bg-blue-600 hover:bg-blue-700 gap-2">
                <CheckCircle className="w-4 h-4" /> Mark Complete
              </Button>
            </div>
          </div>
        )}

        {/* Timeline header */}
        <div className="flex items-center justify-between">
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
          <Button onClick={() => setShowNewSession(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Session
          </Button>
        </div>

        {/* Sessions list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : sessions.length > 0 ? (
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
        ) : (
          <div className="text-center py-16 bg-muted/20 rounded-2xl border-2 border-dashed">
            <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-muted-foreground">No Sessions Scheduled</h3>
            <p className="text-sm text-muted-foreground/60 mt-1">Click "Add Session" to create the first session</p>
          </div>
        )}

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
                    {["09:00 AM","10:00 AM","11:00 AM","11:30 AM","02:00 PM","03:00 PM","04:00 PM","05:00 PM"].map(t => (
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
                    {[15,30,45,60,90,120].map(d => <SelectItem key={d} value={d.toString()}>{d} minutes</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold block mb-2">Session Fee (₹) <span className="text-red-500">*</span></Label>
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

      </div>
    </Modal>
  );
}