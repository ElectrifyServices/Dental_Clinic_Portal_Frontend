import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePatientQuery } from './patients/usePatientQuery';
import { useDeletePatientMutation } from './patients/useDeletePatientMutation';
import { useUpdatePatientStatusMutation } from './patients/useUpdatePatientStatusMutation';
import {
  useCreatePatientMutation,
  mapFormDataToCreatePayload,
} from './patients/useCreatePatientMutation';
import { useUpdatePatientMutation } from './patients/useUpdatePatientMutation';
import { useLocalStorage } from './useLocalStorage';
import { useMedicalHistoriesQuery } from './patients/useMedicalHistoriesQuery';
import { useAllergiesQuery } from './patients/useAllergiesQuery';

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

  const { data: rawMedicalHistories } = useMedicalHistoriesQuery();
  const { data: rawAllergies } = useAllergiesQuery();

  const { mutateAsync: deletePatientMutation } = useDeletePatientMutation();
  const { mutateAsync: updateStatusMutation } = useUpdatePatientStatusMutation();
  const { mutateAsync: createPatientMutation } = useCreatePatientMutation();
  const { mutateAsync: updatePatientMutation } = useUpdatePatientMutation();

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

    const REVERSE_BLOOD_GROUP_MAP: Record<string, string> = {
      "A_POSITIVE": "A+",
      "A_NEGATIVE": "A-",
      "B_POSITIVE": "B+",
      "B_NEGATIVE": "B-",
      "AB_POSITIVE": "AB+",
      "AB_NEGATIVE": "AB-",
      "O_POSITIVE": "O+",
      "O_NEGATIVE": "O-",
    };

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
      gender: p.gender ? p.gender.toLowerCase() : '',
      
      // Mapped fields for usePatientForm
      dateOfBirth: p.date_of_birth || p.dateOfBirth || '',
      bloodGroup: REVERSE_BLOOD_GROUP_MAP[p.blood_group] || p.blood_group || p.bloodGroup || '',
      maritalStatus: p.marital_status ? p.marital_status.toLowerCase() : '',
      address: p.address || '',
      occupation: p.occupation || '',
      
      // Emergency Contact
      emergencyName: p.emergency_contact_name || p.emergencyName || '',
      emergencyContact: p.emergency_contact_phone || p.emergencyContact || '',
      emergencyRelation: p.emergency_contact_relation || p.emergencyRelation || '',
      
      // Referral & Category
      referredBy: p.referred_by || p.referredBy || '',
      category: p.patient_category ? p.patient_category.toLowerCase() : 'regular',
      isFOC: p.is_foc || p.isFOC || false,
      defaultDiscount: p.discount_percentage !== undefined ? p.discount_percentage : (p.defaultDiscount || 0),
      
      // Medical History
      medicalHistory: (p.medicalHistories || p.medical_histories || p.medicalHistory || []).map((m: any) => typeof m === 'object' ? (m.history_id || m.medical_history_id || m.id) : m),
      allergies: (p.allergies || []).map((a: any) => typeof a === 'object' ? (a.allergy_id || a.id) : a),
      medicalHistoryNames: (p.medicalHistories || p.medical_histories || p.medicalHistory || []).map((m: any) => {
        if (typeof m === 'object') {
          return m.history?.name || m.medical_history?.name || m.name || m.history_id || m.medical_history_id || m.id;
        }
        const found = (rawMedicalHistories || []).find((mh: any) => mh.id === m);
        return found ? (found.name || found.history_name || m) : m;
      }),
      allergyNames: (p.allergies || []).map((a: any) => {
        if (typeof a === 'object') {
          return a.allergy?.allergy_name || a.allergy?.name || a.allergy_name || a.name || a.allergy_id || a.id;
        }
        const found = (rawAllergies || []).find((al: any) => al.id === a);
        return found ? (found.allergy_name || found.name || a) : a;
      }),
      pastDentalHistory: p.past_dental_history || p.pastDentalHistory || '',
      
      // Previous Dentist
      previousDoctorName: p.previous_doctor_name || p.previousDoctorName || '',
      previousClinicName: p.clinic_name || p.previousClinicName || '',
      previousDoctorPhone: p.doctor_phone || p.previousDoctorPhone || '',
      previousLastVisitDate: p.last_visit_date || p.previousLastVisitDate || '',
      previousClinicAddress: p.clinic_address || p.previousClinicAddress || '',
      previousReason: p.reason_for_treatment || p.previousReason || '',
      previousTreatments: (p.previous_treatments || p.previousTreatments || []).map((t: any) => typeof t === 'object' ? (t.treatment_name || t.name || t.id || '') : t),
      
      // Consents
      consentFormUrl: p.consent_form_image || p.consentFormUrl || '',
      patientSignature: p.consent_signature_image || p.patientSignature || '',
    }));
  }, [apiPatients, rawMedicalHistories, rawAllergies]);

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

      const payload = mapFormDataToCreatePayload(patient, {
        primaryPatientId: parentPatientId || undefined,
      });

      if (isNew) {
        await createPatientMutation(payload);
      } else {
        await updatePatientMutation({ id: patient.id, formData: payload });
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
