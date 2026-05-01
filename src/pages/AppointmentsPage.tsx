import React, { useState } from 'react';
import { Stethoscope, Users, AlertTriangle, Calendar, LayoutGrid, ListFilter } from 'lucide-react';
import { AppointmentCalendar } from '../components/Appointments/AppointmentCalendar';
import { AppointmentList } from '../components/Appointments/AppointmentList';
import { AppointmentStats } from '../components/Appointments/AppointmentList/AppointmentStats';
import { Button } from '@/components/ui/Button';

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
  const [viewMode, setViewMode] = useState("calendar");
  const listCount = appointments.filter((a) => a.status !== "no-show").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 backdrop-blur-md p-4 rounded-[2rem] border border-white/50 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Appointments</h1>
          <p className="text-gray-500 font-medium">Schedule and manage patient visits</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100/50 p-1.5 rounded-2xl">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              viewMode === 'calendar' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Calendar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              viewMode === 'list' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            List View ({listCount})
          </button>
          <button
            onClick={() => setViewMode('no-show')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              viewMode === 'no-show' 
                ? 'bg-red-50 text-red-600 shadow-sm' 
                : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            No Show
          </button>
        </div>
      </div>
      
      <AppointmentStats appointments={appointments} />

      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        {viewMode === "calendar" && (
          <AppointmentCalendar
            onNewAppointment={handleNewAppointment}
            appointments={appointments}
            doctors={doctorsWithSchedules}
            onBookAppointment={(doctorId, date, time) => {
              const doctor = doctorsWithSchedules.find(d => d.id === doctorId);
              setSelectedAppointment({ doctorId, doctorName: doctor?.name, date, time } as any);
              setShowAppointmentForm(true);
            }}
            onEditAppointment={(apt) => {
              setSelectedAppointment(apt);
              setShowAppointmentForm(true);
            }}
          />
        )}
        {(viewMode === "list" || viewMode === "no-show") && (
          <AppointmentList
            appointments={appointments.filter(
              (apt) => viewMode === 'list' ? apt.status !== "no-show" : apt.status === "no-show",
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
      </div>
    </div>
  );
};
