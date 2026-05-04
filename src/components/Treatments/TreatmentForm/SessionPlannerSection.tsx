import React from 'react';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';

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
  baseDate
}: SessionPlannerSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Treatment Sessions</h3>
            <p className="text-xs text-gray-500 font-medium">Plan multiple visits for complex procedures</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAddSession}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 flex items-center text-sm font-semibold transition-all shadow-md shadow-blue-100 active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Visit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session, index) => (
          <div
            key={session.id}
            className={`p-5 rounded-2xl border transition-all hover:shadow-md relative group ${
              session.status === 'completed' ? 'bg-emerald-50/50 border-emerald-100' :
              session.status === 'in-progress' ? 'bg-blue-50/50 border-blue-100' :
              'bg-gray-50/50 border-gray-100'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  session.status === 'completed' ? 'bg-emerald-600 text-white' :
                  session.status === 'in-progress' ? 'bg-blue-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={session.name}
                  onChange={(e) => onUpdateSession(session.id, { name: e.target.value })}
                  className="bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-gray-900 w-full"
                  placeholder="Session Name"
                />
              </div>
              <button
                type="button"
                onClick={() => onRemoveSession(session.id)}
                className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Visit Date</label>
                <input
                  type="date"
                  value={session.scheduledDate}
                  onChange={(e) => onUpdateSession(session.id, { scheduledDate: e.target.value, isModified: true })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white outline-none text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Status</label>
                <select
                  value={session.status}
                  onChange={(e) => onUpdateSession(session.id, { status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white outline-none text-xs font-semibold"
                >
                  <option value="planned">Planned</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Duration (Min)</label>
                <input
                  type="number"
                  value={session.duration}
                  onChange={(e) => onUpdateSession(session.id, { duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white outline-none text-xs font-semibold"
                  min="15"
                  step="15"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Cost (₹)</label>
                <input
                  type="number"
                  value={session.cost}
                  onChange={(e) => onUpdateSession(session.id, { cost: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white outline-none text-xs font-semibold"
                  min="0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
