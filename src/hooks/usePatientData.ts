import { useMemo, useState, useCallback } from 'react';
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
import { useBulkImportEmployeeMutation } from './corporate/useBulkImportEmployeeMutation';
import { useDebounce } from './useDebounce';

export function usePatientData(params?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  // Search & filter state – these drive the API query
  const [patientSearch, setPatientSearch] = useState('');
  const [patientStatus, setPatientStatus] = useState('all');
  const [patientCategory, setPatientCategory] = useState('all');
  const [patientPage, setPatientPage] = useState(1);
  const patientLimit = 50;

  const apiFilters = useMemo(() => {
    const filters: Record<string, string[]> = {};
    if (patientStatus !== 'all') {
      filters.status = [patientStatus.toUpperCase()];
    }
    if (patientCategory !== 'all') {
      filters.category = [patientCategory.toUpperCase()];
    }
    return Object.keys(filters).length > 0 ? filters : undefined;
  }, [patientStatus, patientCategory]);

  const debouncedSearch = useDebounce(patientSearch, 500);

  // Reset page to 1 when filters change
  useMemo(() => {
    setPatientPage(1);
  }, [debouncedSearch, patientStatus, patientCategory]);

  const isEnabled = useMemo(() => {
    if (params?.enabled === false) return false;
    const path = window.location.pathname;
    const isExcluded = path.includes('/inventory') || path.includes('/profit-sharing') || path.includes('/staff') || path.includes('/membership');
    return !isExcluded;
  }, [params?.enabled]);

  const { data: apiPatients, isLoading: isPatientsLoading } = usePatientQuery({
    page: patientPage,
    limit: patientLimit,
    search: debouncedSearch || undefined,
    filters: apiFilters,
  }, { enabled: isEnabled });

  const { data: rawMedicalHistories } = useMedicalHistoriesQuery({ staleTime: 300000 });
  const { data: rawAllergies } = useAllergiesQuery({ staleTime: 300000 });

  const { mutateAsync: deletePatientMutation } = useDeletePatientMutation();
  const { mutateAsync: updateStatusMutation } = useUpdatePatientStatusMutation();
  const { mutateAsync: createPatientMutation } = useCreatePatientMutation();
  const { mutateAsync: updatePatientMutation } = useUpdatePatientMutation();
  const { mutateAsync: bulkImportEmployee } = useBulkImportEmployeeMutation();

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
    } else if (apiPatients && Array.isArray((apiPatients as any).data?.data?.data)) {
      rawList = (apiPatients as any).data.data.data;
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
    await deletePatientMutation({ id });
  };

  const handleUpdatePatientStatus = async (id: string, status: 'ACTIVE' | 'INACTIVE') => {
    try {
      await updateStatusMutation({ id, status });
    } catch (e) {
    }
  };

  // Refresh the patient list manually
  const refetchPatients = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['patients'] });
  }, [queryClient]);

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
        primaryPatientId: parentPatientId || patient.parentId || patient.primaryPatientId || patient.primary_patient_id || undefined,
      });

      if (isNew) {
        return await createPatientMutation(payload);
      } else {
        return await updatePatientMutation({ id: patient.id, formData: payload });
      }
    } catch (e) {
      throw e; // re-throw so ModalRegistry can show an error toast if needed
    }
  };

  // Bulk save
  const handleBulkSavePatients = async (newPatients: any[]) => {
    try {
      const payload = {
        employees: newPatients.map((p) => ({
          name: p.name,
          emp_id: p.emp_id || `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          phone: p.phone || "",
          email: p.email || "",
          gender: (p.gender || "MALE").toUpperCase(),
          company_name: p.company_name || p.companyName || "Corporate",
          designation: p.designation || p.occupation || "Employee",
          department: p.department || "Staff",
          corporate_plan_id: p.corporate_plan_id || p.corporatePlanId || p.companyId || "",
          date_of_birth: p.date_of_birth || p.dateOfBirth || "1990-01-01",
          eligible_date: p.eligible_date || p.eligibleDate || new Date().toISOString().split("T")[0],
        })),
      };
      await bulkImportEmployee(payload);
      refetchPatients();
    } catch (e) {
      throw e;
    }
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
    patientStatus,
    setPatientStatus,
    patientCategory,
    setPatientCategory,
    queuedPatients,
    setQueuedPatients,
    handleSavePatient,
    handleDeletePatient,
    handleUpdatePatientStatus,
    handleBulkSavePatients,
    refetchPatients,
    patientPage,
    setPatientPage,
    totalItems: (apiPatients as any)?.pagination?.total_items || (apiPatients as any)?.data?.pagination?.total_items || (apiPatients as any)?.total || 0,
    totalPages: (apiPatients as any)?.pagination?.total_pages || (apiPatients as any)?.data?.pagination?.total_pages || (apiPatients as any)?.totalPages || 1,
  };
}
