import { useMemo, useState } from 'react';
import { useAppointmentsListQuery } from './appointments/useAppointmentsListQuery';
import { useDeleteAppointmentMutation } from './appointments/useDeleteAppointmentMutation';

export function useAppointmentData() {
  const [apptSearch, setApptSearch] = useState('');
  const [apptFilters, setApptFilters] = useState<any>({});

  const { data: apiResponse } = useAppointmentsListQuery({
    page: 1,
    limit: 1000,
    search: apptSearch || undefined,
    filters: apptFilters,
  });

  const { mutateAsync: deleteAppointment } = useDeleteAppointmentMutation();

  const appointments = useMemo(() => {
    let rawList: any[] = [];
    if (Array.isArray(apiResponse)) {
      rawList = apiResponse;
    } else if (apiResponse && Array.isArray((apiResponse as any).appointments)) {
      rawList = (apiResponse as any).appointments;
    } else if (apiResponse && Array.isArray((apiResponse as any).data?.appointments)) {
      rawList = (apiResponse as any).data.appointments;
    } else if (apiResponse && Array.isArray((apiResponse as any).data?.data)) {
      rawList = (apiResponse as any).data.data;
    } else if (apiResponse && Array.isArray((apiResponse as any).data)) {
      rawList = (apiResponse as any).data;
    }

    return rawList.map((a: any) => ({
      id: a.id,
      patientName: a.patient_name || a.patientName,
      patientPhone: a.patient_phone || a.patientPhone,
      doctorName: a.doctor?.name || a.doctorName || "Doctor",
      date: a.date,
      time: a.start_time || a.time,
      treatmentType: a.specific_treatment || a.treatmentType || "General Consultation",
      cost: a.treatment_cost || a.cost || 0,
      status: (a.status || "scheduled").toLowerCase(),
      concern: a.concern,
      notes: a.notes,
      doctorId: a.doctor_id || a.doctor?.id,
      patientId: a.patient_id,
      duration: a.slot_duration_mins || a.duration || 30,
    }));
  }, [apiResponse]);

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

  const handleUpdateAppointmentStatus = (id: string, status: string) => {
    // This will be handled by mutation
  };

  return {
    appointments,
    apptSearch,
    setApptSearch,
    apptFilters,
    setApptFilters,
    handleSaveAppointment,
    handleDeleteAppointment,
    handleUpdateAppointmentStatus,
  };
}



