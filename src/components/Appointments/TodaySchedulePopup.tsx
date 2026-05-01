import React from 'react';
import { X, Layout } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DoctorAvailability } from './TodaySchedule/DoctorAvailability';
import { AppointmentTimeline } from './TodaySchedule/AppointmentTimeline';

interface TodaySchedulePopupProps {
  onClose: () => void;
  appointments: any[];
  doctors: any[];
  doctorAvailability: { [key: string]: boolean };
  onToggleDoctorAvailability: (doctorId: string) => void;
}

const STATUS_VARIANTS: Record<string, any> = {
  completed: 'green', 'in-progress': 'blue', 'checked-in': 'purple',
  confirmed: 'indigo', scheduled: 'gray', cancelled: 'red', 'no-show': 'amber',
};

export function TodaySchedulePopup({
  onClose,
  appointments = [],
  doctors = [],
  doctorAvailability = {},
  onToggleDoctorAvailability = () => {},
}: TodaySchedulePopupProps) {

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.date === todayStr);

  const completedCount = todayAppointments.filter(a => a.status === 'completed').length;
  const pendingCount   = todayAppointments.filter(
    a => !['completed', 'cancelled', 'no-show'].includes(a.status)
  ).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl border-none overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-primary p-8 text-white relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner ring-1 ring-white/20">
                <Layout className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Today's Schedule</h2>
                <p className="text-white/70 text-sm font-bold uppercase tracking-widest mt-1">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-white/10 hover:bg-white/20 text-white h-10 w-10 border-none">
              <X className="w-5 h-5" />
            </Button>
          </div>
          {/* Background Decoration */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Total Booked', val: todayAppointments.length, bg: 'bg-secondary/50', border: 'border-secondary', text: 'text-primary' },
              { label: 'Completed', val: completedCount, bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
              { label: 'Pending Slots', val: pendingCount, bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700' }
            ].map((s, i) => (
              <div key={i} className={`${s.bg} p-6 rounded-[1.5rem] border ${s.border} shadow-sm transition-transform hover:scale-[1.02]`}>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">{s.label}</p>
                <p className={`text-3xl font-black ${s.text}`}>{s.val}</p>
              </div>
            ))}
          </div>

          <DoctorAvailability 
            doctors={doctors} 
            doctorAvailability={doctorAvailability} 
            onToggle={onToggleDoctorAvailability} 
          />

          <AppointmentTimeline 
            appointments={todayAppointments} 
            doctors={doctors} 
            statusVariants={STATUS_VARIANTS} 
          />
        </div>
      </div>
    </div>
  );
}
