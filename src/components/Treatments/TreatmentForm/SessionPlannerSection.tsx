import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Calendar, Plus, Trash2, Clock, DollarSign, FileText } from "lucide-react";

interface SessionPlannerSectionProps {
  sessions: any[];
  onAddSession: () => void;
  onRemoveSession: (id: string) => void;
  onUpdateSession: (id: string, updates: any) => void;
  baseDate: string;
}

export function SessionPlannerSection({
  sessions,
  onAddSession,
  onRemoveSession,
  onUpdateSession,
  baseDate,
}: SessionPlannerSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Treatment Sessions
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Plan multiple visits for complex procedures
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={onAddSession}
          className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 flex items-center text-sm font-semibold transition-all shadow-md shadow-primary/20 active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session, index) => (
          <div
            key={session.id}
            className={`p-5 rounded-2xl border transition-all hover:shadow-md relative group ${
              session.status === "completed"
                ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                : session.status === "in-progress"
                  ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                  : session.status === "cancelled"
                    ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                    : "bg-muted/30 border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    session.status === "completed"
                      ? "bg-emerald-600 text-white"
                      : session.status === "in-progress"
                        ? "bg-blue-600 text-white"
                        : session.isRequired
                          ? "bg-primary text-white"
                          : "bg-muted-foreground/40 text-white"
                  }`}
                >
                  {index + 1}
                </div>
                <Input
                  type="text"
                  value={session.name}
                  onChange={(e) =>
                    onUpdateSession(session.id, { name: e.target.value })
                  }
                  className="bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-foreground flex-1"
                  placeholder="Session Name"
                />
              </div>
              <div className="flex items-center gap-1">
                {!session.isRequired && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold">
                    Optional
                  </span>
                )}
                <Button
                  type="button"
                  onClick={() => onRemoveSession(session.id)}
                  className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  disabled={sessions.length === 1 && session.isRequired}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {/* Visit Date */}
              <div>
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Visit Date
                </Label>
                <Input
                  type="date"
                  value={session.scheduledDate || session.suggestedDate}
                  onChange={(e) =>
                    onUpdateSession(session.id, {
                      scheduledDate: e.target.value,
                      visit_date: e.target.value,
                      isModified: true,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background outline-none text-sm"
                  min={baseDate}
                />
              </div>

              {/* Start Time & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Start Time
                  </Label>
                  <select
                    value={session.startTime || "09:00"}
                    onChange={(e) =>
                      onUpdateSession(session.id, {
                        startTime: e.target.value,
                        start_time: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background outline-none text-sm"
                  >
                    <option value="09:00">09:00 AM</option>
                    <option value="09:30">09:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="10:30">10:30 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="12:30">12:30 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="13:30">01:30 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="14:30">02:30 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="15:30">03:30 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="16:30">04:30 PM</option>
                    <option value="17:00">05:00 PM</option>
                  </select>
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Duration (min)
                  </Label>
                  <select
                    value={session.duration || 45}
                    onChange={(e) =>
                      onUpdateSession(session.id, {
                        duration: parseInt(e.target.value),
                        duration_min: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background outline-none text-sm"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                    <option value="180">3 hours</option>
                  </select>
                </div>
              </div>

              {/* Session Fee & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3" />
                    Session Fee (₹)
                  </Label>
                  <Input
                    type="number"
                    value={session.cost || 0}
                    onChange={(e) =>
                      onUpdateSession(session.id, {
                        cost: parseInt(e.target.value) || 0,
                        session_fee: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background outline-none text-sm"
                    min="0"
                    step="100"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">
                    Status
                  </Label>
                  <select
                    value={session.status || "scheduled"}
                    onChange={(e) =>
                      onUpdateSession(session.id, { status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background outline-none text-sm capitalize"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Clinical Objectives / Notes */}
              <div>
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3 h-3" />
                  Clinical Objectives
                </Label>
                <Textarea
                  value={session.notes || session.description || ""}
                  onChange={(e) =>
                    onUpdateSession(session.id, {
                      notes: e.target.value,
                      description: e.target.value,
                      clinical_objectives: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background outline-none text-sm resize-none"
                  placeholder="What will be done in this session? e.g., Diagnosis, X-ray, cleaning, filling..."
                />
              </div>

              {/* Work Done (for completed sessions) */}
              {(session.status === "completed" || session.status === "in-progress") && (
                <div>
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">
                    Work Done
                  </Label>
                  <Textarea
                    value={session.workDone || ""}
                    onChange={(e) =>
                      onUpdateSession(session.id, {
                        workDone: e.target.value,
                        work_done: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background outline-none text-sm resize-none"
                    placeholder="What was actually performed during this session?"
                  />
                </div>
              )}

              {/* Session Findings (for completed sessions) */}
              {session.status === "completed" && (
                <div>
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">
                    Session Findings
                  </Label>
                  <Textarea
                    value={session.findings || ""}
                    onChange={(e) =>
                      onUpdateSession(session.id, {
                        findings: e.target.value,
                        session_findings: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background outline-none text-sm resize-none"
                    placeholder="Clinical findings, observations, and notes from the session..."
                  />
                </div>
              )}
            </div>

            {/* Modified indicator */}
            {session.isModified && (
              <div className="mt-3 pt-2 border-t border-dashed border-border">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                  ⚡ Modified from original plan
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Section */}
      {sessions.length > 0 && (
        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-foreground">Total Sessions:</span>
            <span className="font-bold text-primary">{sessions.length}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="font-semibold text-foreground">Total Cost:</span>
            <span className="font-bold text-primary">
              ₹{sessions.reduce((sum, s) => sum + (s.cost || 0), 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="font-semibold text-foreground">Total Duration:</span>
            <span className="font-bold text-primary">
              {sessions.reduce((sum, s) => sum + (s.duration || 0), 0)} minutes
            </span>
          </div>
        </div>
      )}
    </div>
  );
}