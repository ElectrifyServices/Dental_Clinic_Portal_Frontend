import React, { useState } from 'react';
import { Calendar, Clock, Plus, CheckCircle, AlertCircle, User, Stethoscope, X } from 'lucide-react';

interface TreatmentSession {
  id: string;
  sessionNumber: number;
  date: string;
  status: 'scheduled' | 'completed' | 'in-progress' | 'cancelled';
  notes: string;
  appointmentId?: string;
  duration: number;
  cost: number;
}

interface TreatmentSessionManagerProps {
  treatmentId: string;
  patientName: string;
  procedure: string;
  onScheduleAppointment: (sessionData: any) => void;
  onClose: () => void;
}

export function TreatmentSessionManager({ 
  treatmentId, 
  patientName, 
  procedure, 
  onScheduleAppointment, 
  onClose 
}: TreatmentSessionManagerProps) {
  const [sessions, setSessions] = useState<TreatmentSession[]>([
    {
      id: '1',
      sessionNumber: 1,
      date: '2024-01-15',
      status: 'completed',
      notes: 'Initial consultation completed. Treatment plan discussed with patient.',
      duration: 60,
      cost: 2000
    },
    {
      id: '2',
      sessionNumber: 2,
      date: '2024-01-22',
      status: 'scheduled',
      notes: 'Main treatment session scheduled. Patient confirmed availability.',
      appointmentId: 'APT-002',
      duration: 45,
      cost: 2000
    },
    {
      id: '3',
      sessionNumber: 3,
      date: '2024-01-29',
      status: 'planned',
      notes: 'Follow-up session for treatment completion.',
      duration: 30,
      cost: 1000
    }
  ]);

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

    setSessions([...sessions, session]);

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

  const totalCost = sessions.reduce((sum, session) => sum + session.cost, 0);
  const completedSessions = sessions.filter(s => s.status === 'completed').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Treatment Session Management</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {/* Sessions List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Treatment Sessions</h3>
              <button
                onClick={() => setShowNewSession(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-cyan-700 flex items-center shadow-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Session
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sessions.map((session) => (
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
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border flex items-center ${getStatusColor(session.status)}`}>
                        {getStatusIcon(session.status)}
                        <span className="ml-1">{session.status.toUpperCase()}</span>
                      </span>
                      <p className="font-bold text-gray-900 mt-1">₹{session.cost.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 rounded-lg p-3 border border-white/50">
                    <p className="text-gray-700 text-sm">{session.notes}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>Duration: {session.duration} min</span>
                      {session.appointmentId && (
                        <span>ID: {session.appointmentId}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-end mt-3 space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          // Edit session functionality
                          console.log('Edit session:', session.id);
                        }}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200"
                      >
                        Edit Session
                      </button>
                      {session.status === 'scheduled' && (
                        <button
                          type="button"
                          onClick={() => {
                            // Reschedule session functionality
                            console.log('Reschedule session:', session.id);
                          }}
                          className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all duration-200"
                        >
                          Reschedule
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Session Form */}
          {showNewSession && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-3">Schedule New Session</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newSession.date}
                    onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                    className="w-full px-2 py-1 text-sm border border-blue-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={newSession.time}
                    onChange={(e) => setNewSession({...newSession, time: e.target.value})}
                    className="w-full px-2 py-1 text-sm border border-blue-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">Duration</label>
                  <input
                    type="number"
                    value={newSession.duration}
                    onChange={(e) => setNewSession({...newSession, duration: parseInt(e.target.value)})}
                    className="w-full px-2 py-1 text-sm border border-blue-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    min="15"
                    step="15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    value={newSession.cost}
                    onChange={(e) => setNewSession({...newSession, cost: parseInt(e.target.value)})}
                    className="w-full px-2 py-1 text-sm border border-blue-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-blue-700 mb-1">Session Notes</label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                  rows={2}
                  className="w-full px-2 py-1 text-sm border border-blue-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter notes for this session..."
                />
              </div>
              
              <div className="mb-3 p-2 bg-blue-100 rounded-lg border border-blue-300">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">Scheduling Options:</h4>
                <div className="space-y-1">
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="ml-2 text-xs text-blue-800">Allow ±3 days flexibility</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="ml-2 text-xs text-blue-800">Send reminder 24 hours before</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="ml-2 text-xs text-blue-800">Allow patient to reschedule online</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowNewSession(false)}
                  className="px-3 py-2 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSession}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Schedule Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}