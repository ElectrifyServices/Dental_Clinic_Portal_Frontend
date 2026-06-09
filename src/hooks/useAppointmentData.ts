import { useMemo, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppointmentsListQuery } from './appointments/useAppointmentsListQuery';
import { useDeleteAppointmentMutation } from './appointments/useDeleteAppointmentMutation';
import { useMarkNoShowMutation } from './appointments/useMarkNoShowMutation';
import { useRestoreAppointmentStatusMutation } from './appointments/useRestoreAppointmentStatusMutation';
import { useDebounce } from './useDebounce';
import { toast } from '../components/ui';

export function useAppointmentData() {
  const queryClient = useQueryClient();
  const [apptSearch, setApptSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [apptFilter, setApptFilter] = useState('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(apptSearch, 500);

  const apptFilters = useMemo(() => {
    const f: any = {};
    if (selectedDate && apptFilter !== 'week' && apptFilter !== 'all') {
      f.date = [selectedDate];
    }
    if (apptFilter === 'today') {
      const d = new Date();
      f.date = [`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`];
    }
    if (selectedDoctorId) {
      f.doctor_id = [selectedDoctorId];
    }
    return f;
  }, [selectedDate, apptFilter, selectedDoctorId]);

  const isEnabled = useMemo(() => {
    const path = window.location.pathname;
    const isExcluded = path.includes('/inventory') || path.includes('/profit-sharing') || path.includes('/staff') || path.includes('/corporate-plans') || path.includes('/consent') || path.includes('/treatments');
    return !isExcluded;
  }, []);

  const { data: apiResponse } = useAppointmentsListQuery({
    page: 1,
    limit: 1000,
    search: debouncedSearch || undefined,
    filters: apptFilters,
  }, { enabled: isEnabled });

  const { data: noShowApiResponse } = useAppointmentsListQuery({
    page: 1,
    limit: 1000,
    search: debouncedSearch || undefined,
    filters: { ...apptFilters, list_no_show: ["true"] },
  }, { enabled: isEnabled });

  const { mutateAsync: deleteAppointment } = useDeleteAppointmentMutation();
  const { mutateAsync: markNoShow } = useMarkNoShowMutation();

  const { mutateAsync: restoreStatus } = useRestoreAppointmentStatusMutation();

  const parseAppointments = (response: any) => {
    let rawList: any[] = [];
    if (Array.isArray(response)) {
      rawList = response;
    } else if (response && Array.isArray((response as any).appointments)) {
      rawList = (response as any).appointments;
    } else if (response && Array.isArray((response as any).data?.appointments)) {
      rawList = (response as any).data.appointments;
    } else if (response && Array.isArray((response as any).data?.data)) {
      rawList = (response as any).data.data;
    } else if (response && Array.isArray((response as any).data)) {
      rawList = (response as any).data;
    }

    return rawList.map((a: any) => ({
      ...a,
      id: a.id,
      patientName: a.patient_name || a.patientName,
      patientPhone: a.patient_phone || a.patientPhone,
      doctorName: a.doctor?.name || a.doctorName || "Doctor",
      date: a.date,
      time: a.start_time_ist || a.start_time || a.time,
      treatment: a.specific_treatment || a.treatment || "",
      treatmentType: a.treatment_type || a.treatmentType || "",
      fee: a.treatment_cost || a.cost || a.fee || 0,
      cost: a.treatment_cost || a.cost || 0,
      status: (a.status || "scheduled").toLowerCase().replace(/_/g, "-"),
      patientConcern: a.concern || a.patientConcern || "",
      concern: a.concern,
      notes: a.notes,
      doctorId: a.doctor_id || a.doctor?.id,
      patientId: a.patient_id,
      duration: a.slot_duration_mins || a.duration || 15,
    }));
  };

  const appointments = useMemo(() => parseAppointments(apiResponse), [apiResponse]);
  const noShowAppointments = useMemo(() => parseAppointments(noShowApiResponse), [noShowApiResponse]);

  const handleSaveAppointment = (appointment: any) => {
    // This is handled by mutations now, but keeping dummy functions for backwards compatibility of context definition
  };

  const handleDeleteAppointment = async (id: string) => {
    await deleteAppointment({ id });
  };

  const handleUpdateAppointmentStatus = async (id: string, status: string) => {
    if (status === 'no-show') {
      try {
        await markNoShow({ id });
        toast.success("Appointment marked as No-Show!");
      } catch (err: any) {
        console.error("Failed to mark appointment as no-show:", err);
        toast.error(err?.response?.data?.message || err?.message || "Failed to mark as no-show");
      }
    } else {
      try {
        const statusMap: Record<string, string> = {
          'scheduled': 'BOOKED',
          'booked': 'BOOKED',
          'checked-in': 'CHECKED_IN',
          'completed': 'COMPLETED',
          'cancelled': 'CANCELLED',
          'no-show': 'NO_SHOW',
        };
        const apiStatus = statusMap[status] || status.toUpperCase().replace(/-/g, '_');
        await restoreStatus({ id, status: apiStatus });
        toast.success(`Appointment status updated to ${status}!`);
      } catch (err: any) {
        console.error("Failed to update appointment status:", err);
        toast.error(err?.response?.data?.message || err?.message || "Failed to update status");
      }
    }
  };

  const refetchAppointments = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
  }, [queryClient]);

  return {
    appointments,
    noShowAppointments,
    apptSearch,
    setApptSearch,
    apptFilters,
    selectedDate,
    setSelectedDate,
    apptFilter,
    setApptFilter,
    selectedDoctorId,
    setSelectedDoctorId,
    handleSaveAppointment,
    handleDeleteAppointment,
    handleUpdateAppointmentStatus,
    refetchAppointments,
  };
}



