import React, { useState } from 'react';
import { Calendar, Clock, Plus, CheckCircle, AlertCircle, X, IndianRupee } from 'lucide-react';

interface TreatmentSession {
  id: string;
  sessionNumber: number;
  date: string;
  status: 'scheduled' | 'completed' | 'in-progress' | 'cancelled' | 'planned';
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
  onClose 
}: TreatmentSessionManagerProps) {
  const [sessions, setSessions] = useState<TreatmentSession[]>(Array.isArray(initialSessions) ? initialSessions : []);
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSession, setNewSession] = useState({
    date: '',
    time: '09:00',
    notes: '',
    duration: 45,
    cost: 0
  });

  const handleAddSession = () => {
    const session: TreatmentSession = {
      id: Date.now().toString(),
      sessionNumber: sessions.length + 1,
      date: newSession.date,
      status: 'scheduled',
      notes: newSession.notes,
      duration: newSession.duration,
      cost: newSession.cost
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
      sessionId: session.id
    });
    setShowNewSession(false);
    setNewSession({ date: '', time: '09:00', notes: '', duration: 45, cost: 0 });
  };

  const handleUpdateSessionStatus = (sessionId: string, newStatus: TreatmentSession['status']) => {
    const updatedSessions = sessions.map(s => s.id === sessionId ? { ...s, status: newStatus } : s);
    setSessions(updatedSessions);
    onUpdateSessions(updatedSessions);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'in-progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'scheduled': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const totalCost = sessions.reduce((sum, s) => sum + (s.cost || 0), 0);
  const completedSessions = sessions.filter(s => s.status === 'completed').length;

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-5xl w-full">
        <div className="modal-header bg-gradient-to-r from-primary/10 to-indigo-50/30">
          <div>
            <h2 className="modal-title text-xl">Session Management</h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">{patientName} • {procedure}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
            <X className="w-5 h-5 text-muted-foreground/60" />
          </button>
        </div>

        <div className="modal-body p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-primary/50 p-6 rounded-3xl border border-primary/20 shadow-sm">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Total Sessions</p>
              <p className="text-3xl font-bold text-blue-900">{sessions.length}</p>
            </div>
            <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Completed</p>
              <p className="text-3xl font-bold text-emerald-900">{completedSessions}</p>
            </div>
            <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 shadow-sm">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Projected Revenue</p>
              <p className="text-3xl font-bold text-indigo-900">₹{totalCost.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Session Timeline
            </h3>
            <button onClick={() => setShowNewSession(true)} className="btn-primary py-2.5 shadow-lg shadow-blue-100">
              <Plus className="w-4 h-4" /> Add Session
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((session) => (
              <div key={session.id} className={`rounded-2xl p-5 border transition-all ${getStatusColor(session.status)} shadow-sm hover:shadow-md`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center font-bold text-sm shadow-sm border border-inherit">
                      {session.sessionNumber}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm tracking-tight">Session {session.sessionNumber}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{new Date(session.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <select
                      value={session.status}
                      onChange={(e) => handleUpdateSessionStatus(session.id, e.target.value as any)}
                      className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border-transparent focus:ring-2 focus:ring-primary/20 bg-card/80 backdrop-blur-sm cursor-pointer outline-none"
                    >
                      <option value="planned">PLANNED</option>
                      <option value="scheduled">SCHEDULED</option>
                      <option value="in-progress">IN PROGRESS</option>
                      <option value="completed">COMPLETED</option>
                      <option value="cancelled">CANCELLED</option>
                    </select>
                    <div className="text-sm font-bold text-foreground mt-1">₹{session.cost.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="bg-card/40 backdrop-blur-sm rounded-xl p-4 border border-white/60">
                  <p className="text-xs font-semibold text-muted-foreground leading-relaxed italic">{session.notes || 'No specific clinical notes added for this session.'}</p>
                  <div className="flex items-center justify-between mt-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest border-t border-border pt-3">
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {session.duration} min</span>
                    {session.appointmentId && <span>Ref: {session.appointmentId}</span>}
                  </div>
                </div>
              </div>
            ))}
            
            {sessions.length === 0 && (
              <div className="col-span-full text-center py-20 bg-muted/50 rounded-3xl border-2 border-dashed border-border">
                <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-sm font-bold text-muted-foreground/60">No treatment sessions scheduled yet.</p>
              </div>
            )}
          </div>

          {showNewSession && (
            <div className="mt-8 bg-primary/50 rounded-3xl p-8 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-blue-900 tracking-tight">Schedule New Session</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="form-label text-primary">Date</label>
                  <input type="date" value={newSession.date} onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                    className="form-input bg-card border-primary/20" min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="form-label text-primary">Time</label>
                  <input type="time" value={newSession.time} onChange={(e) => setNewSession({...newSession, time: e.target.value})}
                    className="form-input bg-card border-primary/20" />
                </div>
                <div>
                  <label className="form-label text-primary">Duration (min)</label>
                  <input type="number" value={newSession.duration} onChange={(e) => setNewSession({...newSession, duration: parseInt(e.target.value)})}
                    className="form-input bg-card border-primary/20" min="15" step="15" />
                </div>
                <div>
                  <label className="form-label text-primary">Cost (₹)</label>
                  <input type="number" value={newSession.cost} onChange={(e) => setNewSession({...newSession, cost: parseInt(e.target.value)})}
                    className="form-input bg-card border-primary/20" min="0" />
                </div>
              </div>
              <div className="mb-6">
                <label className="form-label text-primary">Session Notes</label>
                <textarea value={newSession.notes} onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                  rows={2} className="form-input bg-card border-primary/20" placeholder="Clinical objectives for this session..." />
              </div>
              
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowNewSession(false)} className="btn-secondary py-2.5 px-6">Cancel</button>
                <button onClick={handleAddSession} disabled={!newSession.date} className="btn-primary py-2.5 px-8 shadow-lg shadow-blue-100">
                  Confirm & Schedule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}