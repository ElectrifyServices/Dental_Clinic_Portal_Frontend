import { useMemo, useState } from 'react';
import { useAppointmentsListQuery } from './appointments/useAppointmentsListQuery';
import { useDeleteAppointmentMutation } from './appointments/useDeleteAppointmentMutation';
import { useMarkNoShowMutation } from './appointments/useMarkNoShowMutation';
import { useRestoreAppointmentStatusMutation } from './appointments/useRestoreAppointmentStatusMutation';

export function useAppointmentData() {
  const [apptSearch, setApptSearch] = useState('');
  const [apptFilters, setApptFilters] = useState<any>({});

  const { data: apiResponse } = useAppointmentsListQuery({
    page: 1,
    limit: 1000,
    search: apptSearch || undefined,
    filters: apptFilters,
  });

  const { data: noShowApiResponse } = useAppointmentsListQuery({
    page: 1,
    limit: 1000,
    search: apptSearch || undefined,
    filters: { ...apptFilters, list_no_show: ["true"] },
  });

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
      time: a.start_time || a.time,
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
    try {
      await deleteAppointment({ id });
    } catch (err) {
      console.error("Failed to delete appointment:", err);
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, status: string) => {
    if (status === 'no-show') {
      try {
        await markNoShow({ id });
      } catch (err) {
        console.error("Failed to mark appointment as no-show:", err);
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
      } catch (err) {
        console.error("Failed to update appointment status:", err);
      }
    }
  };

  return {
    appointments,
    noShowAppointments,
    apptSearch,
    setApptSearch,
    apptFilters,
    setApptFilters,
    handleSaveAppointment,
    handleDeleteAppointment,
    handleUpdateAppointmentStatus,
  };
}



