import React, { useState } from 'react';
import { Stethoscope, Users, AlertTriangle } from 'lucide-react';
import { DoctorBooking } from '../components/Appointments/DoctorBooking';
import { AppointmentCalendar } from '../components/Appointments/AppointmentCalendar';
import { AppointmentList } from '../components/Appointments/AppointmentList';

interface AppointmentsPageProps {
  appointments: any[];
  doctorsWithSchedules: any[];
  doctorAvailability: any;
  handleNewAppointment: (date?: any) => void;
  handleDeleteAppointment: (id: string) => void;
  handleUpdateAppointmentStatus: (id: string, status: string) => void;
  handleCheckInPatient: (appointment: any) => void;
  setSelectedAppointment: (apt: any) => void;
  setShowAppointmentForm: (show: boolean) => void;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({
  appointments,
  doctorsWithSchedules,
  doctorAvailability,
  handleNewAppointment,
  handleDeleteAppointment,
  handleUpdateAppointmentStatus,
  handleCheckInPatient,
  setSelectedAppointment,
  setShowAppointmentForm
}) => {
  const [viewMode, setViewMode] = useState("doctors");
  const listCount = appointments.filter((a) => a.status !== "no-show").length;

  return (
    <div className="space-y-6">
      <div className="bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/50 p-3 mb-8 shadow-xl shadow-gray-200/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: View Toggle */}
        <div className="flex bg-gray-100/50 p-1 rounded-2xl">
          <button
            onClick={() => setViewMode('doctors')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.25rem] text-xs font-bold transition-all ${
              viewMode === 'doctors' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Stethoscope className={`w-4 h-4 ${viewMode === 'doctors' ? 'text-blue-600' : 'text-gray-400'}`} />
            Book Appointment
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.25rem] text-xs font-bold transition-all ${
              viewMode === 'list' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users className={`w-4 h-4 ${viewMode === 'list' ? 'text-slate-900' : 'text-gray-400'}`} />
            List ({listCount})
          </button>
        </div>

        {/* Right: Urgent Filters */}
        <div className="flex items-center gap-2 px-2">
          <button
            onClick={() => setViewMode('no-show')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-bold transition-all border ${
              viewMode === 'no-show' 
                ? 'bg-red-50 border-red-200 text-red-600' 
                : 'bg-white border-gray-100 text-gray-500 hover:border-red-100 hover:bg-red-50/50'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${viewMode === 'no-show' ? 'text-red-600' : 'text-gray-300'}`} />
            No Show ({appointments.filter(apt => apt.status === 'no-show').length})
          </button>
        </div>
      </div>

      {viewMode === 'doctors' && (
        <DoctorBooking 
          doctors={doctorsWithSchedules as any} 
          onBookAppointment={(doctorId, date, time) => {
            const doctor = doctorsWithSchedules.find(d => d.id === doctorId);
            setSelectedAppointment({ doctorId, doctorName: doctor?.name, date, time } as any);
            setShowAppointmentForm(true);
          }}
          onViewAppointments={() => setViewMode('list')}
          onViewCalendar={() => setViewMode('calendar')}
          onEditAppointment={(apt) => {
            setSelectedAppointment(apt);
            setShowAppointmentForm(true);
          }}
          appointments={appointments}
        />
      )}
      {viewMode === "calendar" && (
        <AppointmentCalendar
          onNewAppointment={handleNewAppointment}
          appointments={appointments}
        />
      )}
      {viewMode === "list" && (
        <AppointmentList
          appointments={appointments.filter(
            (apt) => apt.status !== "no-show",
          )}
          onEditAppointment={(id) => {
            const apt = appointments.find((a) => a.id === id);
            setSelectedAppointment(apt);
            setShowAppointmentForm(true);
          }}
          onDeleteAppointment={handleDeleteAppointment}
          onUpdateStatus={handleUpdateAppointmentStatus}
          onCheckInPatient={handleCheckInPatient}
        />
      )}
      {viewMode === "no-show" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            No Show Appointments
          </h3>
          <AppointmentList
            appointments={appointments.filter(
              (apt) => apt.status === "no-show",
            )}
            onEditAppointment={(id) => {
              const apt = appointments.find((a) => a.id === id);
              setSelectedAppointment(apt);
              setShowAppointmentForm(true);
            }}
            onDeleteAppointment={handleDeleteAppointment}
            onUpdateStatus={handleUpdateAppointmentStatus}
            onCheckInPatient={handleCheckInPatient}
          />
        </div>
      )}
    </div>
  );
};
