import { useState, useMemo } from "react";
import {
  Calendar, Clock, Plus, CheckCircle, Loader2, ChevronDown, ChevronUp,
  FileText, IndianRupee, Activity, X,
  TrendingUp, CalendarDays, Clock8, ClipboardList, UserRound,
  Stethoscope, BadgeCheck, Timer, Sparkle, Sparkles,
} from "lucide-react";
import { Modal, Button, Badge, Label, Input, Textarea } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

import {
  useTreatmentSessionsQuery,
  useAddTreatmentSessionMutation,
  useUpdateTreatmentSessionMutation,
  useCompleteTreatmentSessionMutation,
  TreatmentSessionResponse,
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


  // FIX: API returns responseObject.data with nested structure
  const { data: apiResponse, isLoading, refetch } = useTreatmentSessionsQuery(treatmentId);
  // Extract the actual data from responseObject.data
  const responseData = apiResponse?.data;
  const addSession      = useAddTreatmentSessionMutation();
  const updateSession   = useUpdateTreatmentSessionMutation();
  const completeSession = useCompleteTreatmentSessionMutation();
  const [showNewSession,        setShowNewSession]        = useState(false);
  const [expandedSessions,      setExpandedSessions]      = useState<Set<string>>(new Set());
  const [completingId,          setCompletingId]          = useState<string | null>(null);
  const [editingClinicalNotes,  setEditingClinicalNotes]  = useState<string | null>(null);
  const [editNotes,             setEditNotes]             = useState("");

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

  // ─── Derived — extract from responseData ───────────────────────────────────

  const sessions: TreatmentSessionResponse[] = useMemo(() => responseData?.sessions ?? [], [responseData]);
  const totalSessions    = responseData?.total ?? 0;
  const completedCount   = responseData?.completed ?? 0;
  const projectedRevenue = responseData?.projected_revenue ?? 0;
  const sessionProgress  = totalSessions > 0 ? (completedCount / totalSessions) * 100 : 0;

  const groupedSessions = useMemo(() => ({
    upcoming:   sessions.filter(s => s.status === "SCHEDULED"),
    inProgress: sessions.filter(s => s.status === "IN_PROGRESS"),
    completed:  sessions.filter(s => s.status === "COMPLETED"),
    cancelled:  sessions.filter(s => s.status === "CANCELLED"),
  }), [sessions]);

  const currentSession = sessions.find(s => s.status === "IN_PROGRESS");

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date TBD";
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "short", day: "2-digit", month: "short", year: "numeric",
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "TBD";
    // If time is already formatted like "09:00 AM", return as is
    if (timeString.includes("AM") || timeString.includes("PM")) {
      return timeString;
    }
    // If it's ISO string, extract time
    try {
      return new Date(timeString).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timeString;
    }
  };

  const toggleExpand = (sessionId: string) => {
    setExpandedSessions(prev => {
      const next = new Set(prev);
      next.has(sessionId) ? next.delete(sessionId) : next.add(sessionId);
      return next;
    });
  };

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleAddSession = async () => {
    if (!newSession.date) { showToast("Please select a date", "error"); return; }
    if (newSession.cost <= 0) { showToast("Please enter a valid session fee", "error"); return; }

    try {
      await addSession.mutateAsync({
        planId:              treatmentId,
        visit_date:          newSession.date,
        start_time:          newSession.time,
        duration_min:        newSession.duration,
        session_fee:         newSession.cost,
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
    newStatus: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
  ) => {
    if (newStatus === "COMPLETED") { setCompletingId(sessionId); return; }
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
    try {
      await completeSession.mutateAsync({ planId: treatmentId, sessionId, ...completeForm });
      showToast(completedCount + 1 >= totalSessions
        ? "All sessions completed! Treatment plan done!"
        : "Session completed!");
      setCompletingId(null);
      setCompleteForm({ work_done: "", session_findings: "", next_session_plan: "" });
      refetch();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Failed to complete", "error");
    }
  };

  const handleUpdateClinicalNotes = async (sessionId: string) => {
    try {
      await updateSession.mutateAsync({
        planId: treatmentId, sessionId, clinical_objectives: editNotes,
      });
      showToast("Clinical objectives updated!");
      setEditingClinicalNotes(null);
      refetch();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Failed to update", "error");
    }
  };

  // ─── Session Card ──────────────────────────────────────────────────────────

  const SessionCard = ({ session }: { session: TreatmentSessionResponse }) => {
    const cfg       = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.SCHEDULED;
    const StatusIcon = cfg.icon;
    const isCompleting = completingId === session.id;
    const isExpanded   = expandedSessions.has(session.id);
    const isEditing    = editingClinicalNotes === session.id;

    // Get appointment info if available
    const hasAppointment = !!session.appointment;
    const appointmentTime = session.appointment?.start_time 
      ? formatTime(session.appointment.start_time)
      : session.start_time;

    return (
      <div className="relative">
        <div className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${cfg.borderColor} ${
          session.status === "IN_PROGRESS" ? "shadow-lg shadow-blue-100" : "hover:shadow-md"
        }`}>
          {/* Card header */}
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
                {session.status !== "COMPLETED" && session.status !== "CANCELLED" && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={session.status}
                      onValueChange={(val) => handleUpdateStatus(session.id, val as any)}
                      disabled={updateSession.isPending}
                    >
                      <SelectTrigger className={`text-[10px] h-auto font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border cursor-pointer outline-none focus:ring-2 transition-all ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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

          {/* Expanded content */}
          {isExpanded && (
            <div className="border-t p-5 bg-muted/10 space-y-4">
              {/* Clinical objectives — editable */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList className="w-3 h-3" /> Clinical Objectives
                  </p>
                  {!isEditing && session.status !== "COMPLETED" && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingClinicalNotes(session.id);
                        setEditNotes(session.clinical_objectives ?? "");
                      }}
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

              {/* Post-session doctor notes */}
              {session.work_done && (
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <BadgeCheck className="w-3 h-3" /> Work Performed
                  </p>
                  <p className="text-sm leading-relaxed">{session.work_done}</p>
                </div>
              )}

              {session.session_findings && (
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Stethoscope className="w-3 h-3" /> Clinical Findings
                  </p>
                  <p className="text-sm leading-relaxed">{session.session_findings}</p>
                </div>
              )}

              {session.next_session_plan && (
                <div>
                  <p className="text-[10px] font-black text-purple-600 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Sparkle className="w-3 h-3" /> Next Session Plan
                  </p>
                  <p className="text-sm leading-relaxed">{session.next_session_plan}</p>
                </div>
              )}

              {session.appointment_id && (
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Appointment linked:</span>
                  <span className="text-[9px] font-mono text-primary/60">{session.appointment_id.slice(-8).toUpperCase()}</span>
                  {session.appointment && (
                    <span className="text-[9px] text-muted-foreground/50 ml-2">
                      ({session.appointment.status})
                    </span>
                  )}
                </div>
              )}

              {session.completed_at && (
                <div className="pt-1 text-right">
                  <span className="text-[9px] text-muted-foreground/50">
                    Completed {new Date(session.completed_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Complete session modal — shown inline above the card */}
        {isCompleting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setCompletingId(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Complete Session {session.visit_number}</h3>
                  <p className="text-sm text-muted-foreground">Record what was done today</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold block mb-2">Work Done <span className="text-red-500">*</span></Label>
                  <Textarea
                    rows={3}
                    placeholder="Describe the procedures performed..."
                    value={completeForm.work_done}
                    onChange={(e) => setCompleteForm(p => ({ ...p, work_done: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none resize-none"
                    autoFocus
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold block mb-2">Clinical Findings <span className="text-red-500">*</span></Label>
                  <Textarea
                    rows={3}
                    placeholder="Observations, measurements, patient response..."
                    value={completeForm.session_findings}
                    onChange={(e) => setCompleteForm(p => ({ ...p, session_findings: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none resize-none"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold block mb-2">Next Session Plan</Label>
                  <Textarea
                    rows={2}
                    placeholder="Recommended follow-up..."
                    value={completeForm.next_session_plan}
                    onChange={(e) => setCompleteForm(p => ({ ...p, next_session_plan: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setCompletingId(null)} className="flex-1">Cancel</Button>
                <Button
                  onClick={() => handleCompleteSession(session.id)}
                  disabled={completeSession.isPending || (!completeForm.work_done && !completeForm.session_findings)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2"
                >
                  {completeSession.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle className="w-4 h-4" />}
                  Complete Session
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal
      title="Treatment Sessions"
      subtitle={`${patientName} • ${procedure}${toothNumber ? ` • Tooth #${toothNumber}` : ""}`}
      onClose={onClose}
      size="5xl"
      icon={<Calendar className="w-5 h-5" />}
      footer={
        <div className="flex justify-end w-full">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="space-y-8">

        {/* Stats dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/10">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-primary/60" />
              <span className="text-2xl font-black text-primary">{totalSessions}</span>
            </div>
            <p className="text-[10px] font-black text-primary/60 uppercase tracking-wider">Total Sessions</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-2xl p-4 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span className="text-2xl font-black text-emerald-600">{completedCount}</span>
            </div>
            <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-wider">Completed</p>
            <div className="mt-2 h-1.5 bg-emerald-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${sessionProgress}%` }} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/30 rounded-2xl p-4 border border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span className="text-2xl font-black text-indigo-600">₹{Number(projectedRevenue).toLocaleString()}</span>
            </div>
            <p className="text-[10px] font-black text-indigo-600/60 uppercase tracking-wider">Projected Revenue</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-2xl p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-black text-blue-600">{groupedSessions.inProgress.length}</span>
            </div>
            <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-wider">In Progress</p>
          </div>
        </div>

        {/* Active session highlight */}
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

        {/* Timeline header + add button */}
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
                <div className="space-y-3">
                  {groupedSessions.inProgress.map(s => <SessionCard key={s.id} session={s} />)}
                </div>
              </div>
            )}

            {groupedSessions.upcoming.length > 0 && (
              <div>
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" /> Upcoming ({groupedSessions.upcoming.length})
                </h4>
                <div className="space-y-3">
                  {groupedSessions.upcoming.map(s => <SessionCard key={s.id} session={s} />)}
                </div>
              </div>
            )}

            {groupedSessions.completed.length > 0 && (
              <div>
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Completed ({groupedSessions.completed.length})
                </h4>
                <div className="space-y-3">
                  {groupedSessions.completed.map(s => <SessionCard key={s.id} session={s} />)}
                </div>
              </div>
            )}

            {groupedSessions.cancelled.length > 0 && (
              <div>
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500" /> Cancelled ({groupedSessions.cancelled.length})
                </h4>
                <div className="space-y-3">
                  {groupedSessions.cancelled.map(s => <SessionCard key={s.id} session={s} />)}
                </div>
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewSession(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl">Schedule New Session</h3>
                    <p className="text-sm text-muted-foreground">Add details for the upcoming appointment</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setShowNewSession(false)} className="p-2 hover:bg-muted rounded-full h-auto">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-semibold block mb-2">Visit Date <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    value={newSession.date}
                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold block mb-2">Start Time</Label>
                  <Select
                    value={newSession.time}
                    onValueChange={(val) => setNewSession({ ...newSession, time: val })}
                  >
                    <SelectTrigger className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["09:00 AM","10:00 AM","11:00 AM","11:30 AM","02:00 PM","03:00 PM","04:00 PM","05:00 PM"].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold block mb-2">Duration (minutes)</Label>
                  <Select
                    value={newSession.duration.toString()}
                    onValueChange={(val) => setNewSession({ ...newSession, duration: parseInt(val) })}
                  >
                    <SelectTrigger className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[15, 30, 45, 60, 90, 120].map(d => (
                        <SelectItem key={d} value={d.toString()}>{d} minutes</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold block mb-2">Session Fee (₹) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    value={newSession.cost || ""}
                    onChange={(e) => setNewSession({ ...newSession, cost: parseInt(e.target.value) || 0 })}
                    min="0"
                    step="500"
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="mb-6">
                <Label className="text-sm font-semibold block mb-2">Clinical Objectives</Label>
                <Textarea
                  value={newSession.clinical_objectives}
                  onChange={(e) => setNewSession({ ...newSession, clinical_objectives: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  placeholder="Describe the goals for this session..."
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowNewSession(false)} className="flex-1">Cancel</Button>
                <Button
                  onClick={handleAddSession}
                  disabled={!newSession.date || !newSession.cost || addSession.isPending}
                  className="flex-1 gap-2"
                >
                  {addSession.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Schedule Session
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
}