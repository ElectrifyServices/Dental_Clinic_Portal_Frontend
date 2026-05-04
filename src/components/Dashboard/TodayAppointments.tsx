import React from 'react';
import { Clock, User, Phone, Calendar } from 'lucide-react';

interface TodayAppointmentsProps {
  appointments?: any[];
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  completed:    { label: 'Completed',   cls: 'badge badge-green' },
  'in-progress':{ label: 'In Progress', cls: 'badge badge-blue' },
  confirmed:    { label: 'Confirmed',   cls: 'badge badge-indigo' },
  scheduled:    { label: 'Scheduled',   cls: 'badge badge-gray' },
  cancelled:    { label: 'Cancelled',   cls: 'badge badge-red' },
  'no-show':    { label: 'No Show',     cls: 'badge badge-red' },
};

export function TodayAppointments({ appointments = [] }: TodayAppointmentsProps) {
  const today = new Date().toDateString();
  const todayAppts = appointments
    .filter(a => new Date(a.date).toDateString() === today)
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 8);

  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Today's Appointments</h2>
          <p className="text-xs text-gray-400 mt-0.5">{todayAppts.length} scheduled today</p>
        </div>
        <Calendar className="w-4 h-4 text-gray-400" />
      </div>
      {todayAppts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 ring-8 ring-blue-50/50">
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-[15px] font-bold text-gray-900 mb-1 uppercase tracking-tight">Your schedule is clear</h3>
          <p className="text-xs text-gray-500 text-center max-w-[220px] leading-relaxed">
            There are no appointments scheduled for today. Take a moment to review your recent patient records.
          </p>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Clinic Optimized
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {todayAppts.map((appt, i) => {
            const sm = STATUS_META[appt.status] || STATUS_META.scheduled;
            return (
              <div key={appt.id || i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-14 flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">{appt.time}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 truncate">{appt.patientName || appt.patient}</span>
                    <span className={sm.cls}>{sm.label}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-400 truncate">{appt.treatmentType || appt.type}</span>
                    {(appt.patientPhone || appt.phone) && (
                      <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                        <Phone className="w-2.5 h-2.5" />{appt.patientPhone || appt.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">{appt.duration || 15}m</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
