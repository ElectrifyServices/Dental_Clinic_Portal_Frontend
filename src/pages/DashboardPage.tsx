import React, { useState } from 'react';
import { UserPlus, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppointmentData } from '../hooks/useAppointmentData';
import { useModal } from '../contexts/ModalContext';
import { Button, FilterTabs, Input } from '@/components/ui';
import { EnhancedDashboardStats } from '../components/Dashboard/DashboardStats';
import { TodayAppointments } from '../components/Dashboard/TodayAppointments';
import { RecentPatients } from '../components/Dashboard/RecentPatients';
import { SmartAlerts } from '../components/Dashboard/SmartAlerts';
import { AppointmentStatusWidget, DoctorPerformanceWidget } from '../components/Dashboard/DashboardWidgets';

const PERIODS = [
  { key: 'today',     label: 'Today'       },
  { key: 'week',      label: 'This Week'   },
  { key: 'month',     label: 'This Month'  },
  { key: 'year',      label: 'This Year'   },
  { key: 'custom',    label: 'Custom'      },
];

export const DashboardPage: React.FC = () => {
  const [period, setPeriod] = useState('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  const { 
    appointments, 
    setStartDate, 
    setEndDate, 
    setApptFilter, 
    setSelectedDate,
    pagination,
    page,
    setPage,
    limit,
    setLimit,
    apptSearch,
    setApptSearch
  } = useAppointmentData({ limit: 10 });
  
  const { state } = useAuth();
  const { setActiveModal, setSelectedPatientId, setPreFilledPatientData, setPatientFormType } = useModal();

  React.useEffect(() => {
    const now = new Date();
    let startD: Date;
    let endD: Date;
    
    switch (period) {
      case 'today':
        startD = new Date();
        endD = new Date();
        break;
      case 'week':
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
        startD = new Date(now.setDate(diff));
        endD = new Date(startD);
        endD.setDate(startD.getDate() + 6);
        break;
      case 'month':
        startD = new Date(now.getFullYear(), now.getMonth(), 1);
        endD = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'year':
        startD = new Date(now.getFullYear(), 0, 1);
        endD = new Date(now.getFullYear(), 11, 31);
        break;
      case 'custom':
        startD = customStart ? new Date(customStart) : new Date();
        endD = customEnd ? new Date(customEnd) : new Date();
        break;
      default:
        startD = new Date();
        endD = new Date();
    }
    
    const formatDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    const startStr = formatDate(startD);
    const endStr = formatDate(endD);

    // Uniformly use startDate and endDate for all periods to ensure the query always triggers
    setApptFilter('custom');
    setSelectedDate('');
    setStartDate(startStr);
    setEndDate(endStr);
  }, [period, customStart, customEnd, setStartDate, setEndDate, setApptFilter, setSelectedDate]);

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
        
        <div className="flex items-center gap-4 flex-wrap">
          {period === 'custom' && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-9 w-auto text-xs px-2 py-1 bg-white/50"
              />
              <span className="text-muted-foreground text-xs font-medium">to</span>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-9 w-auto text-xs px-2 py-1 bg-white/50"
              />
            </div>
          )}
          
          <div className="bg-white/50 rounded-lg p-1 border border-border/50 max-w-full">
            <FilterTabs
              tabs={PERIODS}
              active={period}
              onChange={setPeriod}
            />
          </div>
          
          <Button onClick={handleAddPatient} className="gap-2 flex-shrink-0 shadow-sm w-full sm:w-auto">
            <UserPlus className="w-4 h-4" /> Add New Patient
          </Button>
        </div>
      </div>

      {/* ── KPI Grid + Revenue Chart + Goal ────────────────────────────── */}
      <EnhancedDashboardStats period={period} customStart={customStart} customEnd={customEnd} />

      {/* ── Bottom Section ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Appointments List */}
        <div className="lg:col-span-2">
          <TodayAppointments 
            appointments={appointments} 
            period={period} 
            customStart={customStart} 
            customEnd={customEnd}
            pagination={pagination}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            apptSearch={apptSearch}
            setApptSearch={setApptSearch}
          />
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          <SmartAlerts period={period} customStart={customStart} customEnd={customEnd} />
          <AppointmentStatusWidget period={period} customStart={customStart} customEnd={customEnd} />
        </div>
      </div>

      {/* ── Doctor Performance + Recent Patients ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DoctorPerformanceWidget period={period} customStart={customStart} customEnd={customEnd} />
        <RecentPatients period={period} customStart={customStart} customEnd={customEnd} />
      </div>
    </div>
  );
};
