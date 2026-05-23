import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePatientQuery } from './patients/usePatientQuery';
import { useDeletePatientMutation } from './patients/useDeletePatientMutation';
import { useUpdatePatientStatusMutation } from './patients/useUpdatePatientStatusMutation';
import {
  useCreatePatientMutation,
  mapFormDataToCreatePayload,
} from './patients/useCreatePatientMutation';
import { useLocalStorage } from './useLocalStorage';

export function usePatientData() {
  const queryClient = useQueryClient();

  // Search & filter state – these drive the API query
  const [patientSearch, setPatientSearch] = useState('');
  // undefined = all, true = active only, false = inactive only
  const [patientIsActive, setPatientIsActive] = useState<boolean | undefined>(undefined);

  const { data: apiPatients, isLoading: isPatientsLoading } = usePatientQuery({
    search: patientSearch || undefined,
    is_active: patientIsActive,
  });

  const { mutateAsync: deletePatientMutation } = useDeletePatientMutation();
  const { mutateAsync: updateStatusMutation } = useUpdatePatientStatusMutation();
  const { mutateAsync: createPatientMutation } = useCreatePatientMutation();

  // Local storage for queue (not part of API)
  const [queuedPatients, setQueuedPatients] = useLocalStorage<any[]>('queuedPatients', []);

  // Normalize API response into a flat list
  const patients = useMemo(() => {
    let rawList: any[] = [];

    if (Array.isArray(apiPatients)) {
      rawList = apiPatients;
    } else if (apiPatients && Array.isArray((apiPatients as any).patients)) {
      rawList = (apiPatients as any).patients;
    } else if (apiPatients && Array.isArray((apiPatients as any).data?.patients)) {
      rawList = (apiPatients as any).data.patients;
    } else if (apiPatients && Array.isArray((apiPatients as any).data?.data)) {
      rawList = (apiPatients as any).data.data;
    } else if (apiPatients && Array.isArray((apiPatients as any).data)) {
      rawList = (apiPatients as any).data;
    }

    return rawList.map((p: any) => ({
      ...p,
      id: p.id,
      name: p.name || p.full_name || '',
      email: p.email || '',
      phone: p.phone || p.mobile || '',
      status: p.status || (p.is_active ? 'active' : 'inactive'),
      isActive: p.status === 'ACTIVE' || p.is_active === true,
      avatar: p.profile_picture || p.avatar || '',
      age: p.age || p.dob || '',
      gender: p.gender || '',
    }));
  }, [apiPatients]);

  const handleDeletePatient = async (id: string) => {
    try {
      await deletePatientMutation({ id });
    } catch (e) {
      console.error('Delete patient failed', e);
    }
  };

  const handleUpdatePatientStatus = async (id: string, status: 'ACTIVE' | 'INACTIVE') => {
    try {
      await updateStatusMutation({ id, status });
    } catch (e) {
      console.error('Update patient status failed', e);
    }
  };

  // Refresh the patient list manually
  const refetchPatients = () => {
    queryClient.invalidateQueries({ queryKey: ['patients'] });
  };

  /**
   * Create or update a patient.
   *
   * Called from ModalRegistry as: handleSavePatient(formData, formType, parentPatientId)
   *
   * - If the patient already has an `id` → it's an edit (update API will be
   *   added when the endpoint is available).
   * - If no `id` → new patient, calls POST /patient/create.
   */
  const handleSavePatient = async (
    patient: any,
    _type?: string,
    parentPatientId?: string,
  ) => {
    try {
      const isNew = !patient?.id;

      if (isNew) {
        const payload = mapFormDataToCreatePayload(patient, {
          primaryPatientId: parentPatientId || undefined,
        });
        await createPatientMutation(payload);
      } else {
        // Edit path: refetch for now; update mutation to be wired when API is available
        refetchPatients();
      }
    } catch (e) {
      console.error('Save patient failed', e);
      throw e; // re-throw so ModalRegistry can show an error toast if needed
    }
  };

  // Bulk save (for future use – kept for backward compat)
  const handleBulkSavePatients = (_newPatients: any[]) => {
    // Will be wired to a bulk create API when available
    refetchPatients();
  };

  // setPatients stub – kept for useAppData cross-domain operations (invoice outstanding balance etc.)
  // Since patients are now server-driven, cross-domain balance updates are no-ops until
  // a dedicated balance API is available.
  const setPatients = (_updater: any) => {
    // no-op: patient list is managed by React Query
  };

  return {
    patients,
    setPatients,
    isPatientsLoading,
    patientSearch,
    setPatientSearch,
    patientIsActive,
    setPatientIsActive,
    queuedPatients,
    setQueuedPatients,
    handleSavePatient,
    handleDeletePatient,
    handleUpdatePatientStatus,
    handleBulkSavePatients,
    refetchPatients,
  };
}
