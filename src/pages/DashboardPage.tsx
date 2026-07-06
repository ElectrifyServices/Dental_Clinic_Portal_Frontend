import React from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppointmentData } from '../hooks/useAppointmentData';
import { useModal } from '../contexts/ModalContext';
import { Button } from '@/components/ui';
import { EnhancedDashboardStats } from '../components/Dashboard/DashboardStats';
import { TodayAppointments } from '../components/Dashboard/TodayAppointments';
import { RecentPatients } from '../components/Dashboard/RecentPatients';
import { SmartAlerts } from '../components/Dashboard/SmartAlerts';
import { AppointmentStatusWidget, DoctorPerformanceWidget } from '../components/Dashboard/DashboardWidgets';

export const DashboardPage: React.FC = () => {
  const { appointments } = useAppointmentData();
  const { state } = useAuth();
  const { setActiveModal, setSelectedPatientId, setPreFilledPatientData, setPatientFormType } = useModal();

  const handleAddPatient = () => {
    setSelectedPatientId('');
    setPreFilledPatientData(null);
    setPatientFormType('normal');
    setActiveModal('patientForm');
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const day = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="space-y-4">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card/60 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/50 shadow-sm -mt-3 md:-mt-5">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {greeting},{' '}
            <span className="text-primary">{state.user?.name?.split(' ')[0] ?? 'Doctor'}</span>
          </h1>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
            {day} · Here's your clinic overview
          </p>
        </div>
        <Button onClick={handleAddPatient} className="gap-2 flex-shrink-0">
          <UserPlus className="w-4 h-4" /> Add New Patient
        </Button>
      </div>

      {/* ── KPI Grid + Revenue Chart + Goal ────────────────────────────── */}
      <EnhancedDashboardStats />

      {/* ── Bottom Section ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today Appointments */}
        <div className="lg:col-span-2">
          <TodayAppointments appointments={appointments} />
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          <SmartAlerts />
          <AppointmentStatusWidget />
        </div>
      </div>

      {/* ── Doctor Performance + Recent Patients ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DoctorPerformanceWidget />
        <RecentPatients />
      </div>
    </div>
  );
};
