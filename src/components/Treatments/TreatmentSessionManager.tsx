import { useState } from "react";
import { Calendar, Clock, Plus } from "lucide-react";
import { Modal, Button, ContentCard } from "@/components/ui";

interface TreatmentSession {
  id: string;
  sessionNumber: number;
  date: string;
  status: "scheduled" | "completed" | "in-progress" | "cancelled" | "planned";
  notes: string;
  appointmentId?: string;
  duration: number;
  cost: number;
}

interface TreatmentSessionManagerProps {
  treatmentId: string;
  patientName: string;
  procedure: string;
  sessions: TreatmentSession[];
  onScheduleAppointment: (sessionData: any) => void;
  onUpdateSessions: (updatedSessions: TreatmentSession[]) => void;
  onClose: () => void;
}

export function TreatmentSessionManager({
  treatmentId,
  patientName,
  procedure,
  sessions: initialSessions,
  onScheduleAppointment,
  onUpdateSessions,
  onClose,
}: TreatmentSessionManagerProps) {
  const [sessions, setSessions] = useState<TreatmentSession[]>(
    Array.isArray(initialSessions) ? initialSessions : [],
  );
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSession, setNewSession] = useState({
    date: "",
    time: "09:00",
    notes: "",
    duration: 45,
    cost: 0,
  });

  const handleAddSession = () => {
    const session: TreatmentSession = {
      id: Date.now().toString(),
      sessionNumber: sessions.length + 1,
      date: newSession.date,
      status: "scheduled",
      notes: newSession.notes,
      duration: newSession.duration,
      cost: newSession.cost,
    };
    const updatedSessions = [...sessions, session];
    setSessions(updatedSessions);
    onUpdateSessions(updatedSessions);
    onScheduleAppointment({
      patientName,
      date: newSession.date,
      time: newSession.time,
      type: `${procedure} - Session ${session.sessionNumber}`,
      duration: newSession.duration,
      fee: newSession.cost,
      notes: `Treatment Session ${session.sessionNumber}: ${newSession.notes}`,
      treatmentId,
      sessionId: session.id,
    });
    setShowNewSession(false);
    setNewSession({
      date: "",
      time: "09:00",
      notes: "",
      duration: 45,
      cost: 0,
    });
  };

  const handleUpdateSessionStatus = (
    sessionId: string,
    newStatus: TreatmentSession["status"],
  ) => {
    const updatedSessions = sessions.map((s) =>
      s.id === sessionId ? { ...s, status: newStatus } : s,
    );
    setSessions(updatedSessions);
    onUpdateSessions(updatedSessions);
  };

  const totalCost = sessions.reduce((sum, s) => sum + (s.cost || 0), 0);
  const completedSessions = sessions.filter(
    (s) => s.status === "completed",
  ).length;

  return (
    <Modal
      title="Session Management"
      subtitle={`${patientName} • ${procedure}`}
      onClose={onClose}
      size="5xl"
      icon={<Clock className="w-5 h-5" />}
      footer={
        <div className="flex justify-end w-full">
          <Button
            variant="outline"
            onClick={onClose}
            className="font-black uppercase tracking-widest text-[10px]"
          >
            Close Manager
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ContentCard className="bg-primary/5 border-primary/10">
            <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">
              Total Sessions
            </p>
            <p className="text-3xl font-black text-primary tracking-tighter">
              {sessions.length}
            </p>
          </ContentCard>
          <ContentCard className="bg-emerald-50/50 border-emerald-100">
            <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">
              Completed
            </p>
            <p className="text-3xl font-black text-emerald-600 tracking-tighter">
              {completedSessions}
            </p>
          </ContentCard>
          <ContentCard className="bg-indigo-50/50 border-indigo-100">
            <p className="text-[10px] font-black text-indigo-600/60 uppercase tracking-widest mb-1">
              Projected Revenue
            </p>
            <p className="text-3xl font-black text-indigo-600 tracking-tighter">
              ₹{totalCost.toLocaleString()}
            </p>
          </ContentCard>
        </div>

        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            Session Timeline
          </h3>
          <Button
            onClick={() => setShowNewSession(true)}
            className="shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Add Next Session
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <ContentCard
              key={session.id}
              className={`border-border/50 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5`}
              bodyClassName="p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center font-black text-sm text-foreground">
                    {session.sessionNumber}
                  </div>
                  <div>
                    <h4 className="font-black text-foreground text-sm uppercase tracking-tight">
                      Session {session.sessionNumber}
                    </h4>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">
                      {new Date(session.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <select
                    value={session.status}
                    onChange={(e) =>
                      handleUpdateSessionStatus(
                        session.id,
                        e.target.value as any,
                      )
                    }
                    className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-border/50 bg-muted/20 cursor-pointer outline-none hover:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
                  >
                    <option value="planned">PLANNED</option>
                    <option value="scheduled">SCHEDULED</option>
                    <option value="in-progress">IN PROGRESS</option>
                    <option value="completed">COMPLETED</option>
                    <option value="cancelled">CANCELLED</option>
                  </select>
                  <div className="text-sm font-black text-foreground tracking-tighter">
                    ₹{session.cost.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
                <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                  {session.notes || "No clinical objectives specified."}
                </p>
                <div className="flex items-center justify-between mt-4 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest border-t border-border/50 pt-3">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {session.duration} MIN
                  </span>
                  {session.appointmentId && (
                    <span className="text-primary/60">
                      ID: {session.appointmentId.slice(-6).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </ContentCard>
          ))}

          {sessions.length === 0 && (
            <div className="col-span-full text-center py-24 bg-muted/20 rounded-[3rem] border-2 border-dashed border-border/50">
              <Calendar className="w-16 h-16 text-muted-foreground/10 mx-auto mb-6" />
              <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">
                No sessions found
              </h3>
              <p className="text-xs text-muted-foreground/60 mt-2 font-medium">
                Click "Add Next Session" to begin treatment planning.
              </p>
            </div>
          )}
        </div>

        {showNewSession && (
          <div className="mt-8 p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em]">
                Plan New Session
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={newSession.date}
                  onChange={(e) =>
                    setNewSession({ ...newSession, date: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-primary/10 rounded-xl text-sm font-bold text-foreground focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-1">
                  Available Slots
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-white border border-primary/10 rounded-xl text-sm font-bold text-foreground focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  onChange={(e) => {
                    if (e.target.value) {
                      setNewSession({ ...newSession, time: e.target.value });
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Select slot</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={newSession.time}
                  onChange={(e) =>
                    setNewSession({ ...newSession, time: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-primary/10 rounded-xl text-sm font-bold text-foreground focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-1">
                  Duration (min)
                </label>
                <input
                  type="number"
                  value={newSession.duration}
                  onChange={(e) =>
                    setNewSession({
                      ...newSession,
                      duration: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-primary/10 rounded-xl text-sm font-bold text-foreground focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  min="15"
                  step="15"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-1">
                  Session Fee (₹)
                </label>
                <input
                  type="number"
                  value={newSession.cost}
                  onChange={(e) =>
                    setNewSession({
                      ...newSession,
                      cost: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-primary/10 rounded-xl text-sm font-bold text-foreground focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  min="0"
                />
              </div>
            </div>
            <div className="mb-8 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-1">
                Session Clinical Objectives
              </label>
              <textarea
                value={newSession.notes}
                onChange={(e) =>
                  setNewSession({ ...newSession, notes: e.target.value })
                }
                rows={2}
                className="w-full px-4 py-3 bg-white border border-primary/10 rounded-xl text-sm font-medium text-foreground focus:ring-4 focus:ring-primary/5 outline-none transition-all resize-none"
                placeholder="Enter clinical goals for this session..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowNewSession(false)}
                className="font-black uppercase tracking-widest text-[10px]"
              >
                Discard
              </Button>
              <Button
                onClick={handleAddSession}
                disabled={!newSession.date}
                className="px-10 shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px]"
              >
                Confirm & Schedule Session
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
