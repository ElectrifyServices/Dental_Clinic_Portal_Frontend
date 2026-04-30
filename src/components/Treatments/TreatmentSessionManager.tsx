import React, { useState } from 'react';
import { Calendar, Clock, Plus, CheckCircle, AlertCircle, User, Stethoscope, X } from 'lucide-react';

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

    // Schedule appointment for this session
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
    const updatedSessions = sessions.map(s => 
      s.id === sessionId ? { ...s, status: newStatus } : s
    );
    setSessions(updatedSessions);
    onUpdateSessions(updatedSessions);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const totalCost = Array.isArray(sessions) ? sessions.reduce((sum, session) => sum + (session.cost || 0), 0) : 0;
  const completedSessions = Array.isArray(sessions) ? sessions.filter(s => s.status === 'completed').length : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Treatment Session Management</h2>
            <p className="text-gray-600">{patientName} • {procedure}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-600 font-medium">Total Sessions</p>
              <p className="text-2xl font-bold text-blue-900">{sessions.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-900">{completedSessions}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <p className="text-sm text-purple-600 font-medium">Treatment Revenue</p>
              <p className="text-2xl font-bold text-purple-900">₹{totalCost.toLocaleString()}</p>
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Session Timeline</h3>
              <button
                onClick={() => setShowNewSession(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-cyan-700 flex items-center shadow-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Session
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Array.isArray(sessions) && sessions.map((session) => (
                <div key={session.id} className={`rounded-xl p-4 border transition-all duration-200 ${
                  session.status === 'completed' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                  session.status === 'in-progress' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200' :
                  session.status === 'scheduled' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' :
                  'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 ${
                        session.status === 'completed' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                        session.status === 'in-progress' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' :
                        session.status === 'scheduled' ? 'bg-gradient-to-r from-yellow-600 to-amber-600' :
                        'bg-gradient-to-r from-gray-600 to-slate-600'
                      }`}>
                        {session.sessionNumber}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Session {session.sessionNumber}</h4>
                        <p className="text-sm text-gray-600">{new Date(session.date).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-end space-y-1">
                        <select
                          value={session.status}
                          onChange={(e) => handleUpdateSessionStatus(session.id, e.target.value as any)}
                          className={`text-xs px-2 py-1 rounded-full border font-semibold focus:ring-1 focus:ring-blue-500 ${getStatusColor(session.status)}`}
                        >
                          <option value="planned">PLANNED</option>
                          <option value="scheduled">SCHEDULED</option>
                          <option value="in-progress">IN PROGRESS</option>
                          <option value="completed">COMPLETED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                        <p className="font-bold text-gray-900">₹{session.cost.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 rounded-lg p-3 border border-white/50">
                    <p className="text-gray-700 text-sm">{session.notes || 'No notes added for this session.'}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>Duration: {session.duration} min</span>
                      {session.appointmentId && (
                        <span>ID: {session.appointmentId}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {(!Array.isArray(sessions) || sessions.length === 0) && (
                <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No sessions recorded yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Add New Session Form */}
          {showNewSession && (
            <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Schedule New Session</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-blue-700 mb-1 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    value={newSession.date}
                    onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-700 mb-1 uppercase tracking-wider">Time</label>
                  <input
                    type="time"
                    value={newSession.time}
                    onChange={(e) => setNewSession({...newSession, time: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-700 mb-1 uppercase tracking-wider">Duration (min)</label>
                  <input
                    type="number"
                    value={newSession.duration}
                    onChange={(e) => setNewSession({...newSession, duration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="15"
                    step="15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-700 mb-1 uppercase tracking-wider">Cost (₹)</label>
                  <input
                    type="number"
                    value={newSession.cost}
                    onChange={(e) => setNewSession({...newSession, cost: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-blue-700 mb-1 uppercase tracking-wider">Session Notes</label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="What will be done in this session?"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewSession(false)}
                  className="px-6 py-2 text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSession}
                  disabled={!newSession.date}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
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