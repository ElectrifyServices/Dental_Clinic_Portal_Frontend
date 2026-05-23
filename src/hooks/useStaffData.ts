import { useEffect, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useStaffQuery } from './staff/useStaffQuery';
import { useDeleteStaffMutation } from './staff/useDeleteStaffMutation';
import { useUpdateStaffStatusMutation } from './staff/useUpdateStaffStatusMutation';

export function useStaffData() {
  const { data: apiStaff, isLoading: isStaffLoading } = useStaffQuery();
  const { mutateAsync: deleteStaffMutation } = useDeleteStaffMutation();
  const { mutateAsync: updateStatusMutation } = useUpdateStaffStatusMutation();

  const [emrRecords, setEmrRecords] = useLocalStorage<any[]>('emrRecords', []);
  const [consentForms, setConsentForms] = useLocalStorage<any[]>('consentForms', []);

  const staffMembers = useMemo(() => {
    let rawStaffList: any[] = [];
    if (Array.isArray(apiStaff)) {
      rawStaffList = apiStaff;
    } else if (apiStaff && Array.isArray((apiStaff as any).data?.staffs)) {
      rawStaffList = (apiStaff as any).data.staffs;
    } else if (apiStaff && Array.isArray((apiStaff as any).data?.staff)) {
      rawStaffList = (apiStaff as any).data.staff;
    } else if (apiStaff && Array.isArray((apiStaff as any).data?.data)) {
      rawStaffList = (apiStaff as any).data.data;
    } else if (apiStaff && Array.isArray((apiStaff as any).data)) {
      rawStaffList = (apiStaff as any).data;
    } else if (apiStaff && Array.isArray((apiStaff as any).staffs)) {
      rawStaffList = (apiStaff as any).staffs;
    } else if (apiStaff && Array.isArray((apiStaff as any).responseObject?.data)) {
      rawStaffList = (apiStaff as any).responseObject.data;
    }

    return rawStaffList.map(s => {
      let rawRole = s.role?.name || s.role_id || s.role || 'staff';
      if (typeof rawRole !== 'string') rawRole = String(rawRole);
      const normalizedRole = rawRole.toLowerCase().replace(/[\s_]/g, '');

      // Construct documents array from API fields
      const documents: any[] = [];
      const docTypesMapping: Record<string, string[]> = {
        aadhar_card: ["Aadhaar / Identity Proof", "Aadhaar Card"],
        educational_degree: ["Educational Degree Documents", "Educational Certificate", "Education Certificate"],
        medical_council_registration: ["Medical Council Registration"],
        experience_certificates: ["Experience Certificates", "Experience Certificate", "Previous Employment Proof", "Previous Experience Proof"],
        medical_indemnity_insurance: ["Medical Indemnity Insurance"],
        noc: ["NOC (if applicable)"],
        police_verification: ["Police Verification"],
        pan_card: ["PAN Card"],
        bank_details: ["Bank Details / Passbook"],
        employment_contract: ["Signed Employment Contract", "Signed NDA", "Appointment Letter"],
        resume: ["Resume / CV"],
        medical_fitness: ["Medical Fitness Certificate"],
        vaccination: ["Vaccination Proof (Hep-B/COVID)"]
      };

      for (const [key, labels] of Object.entries(docTypesMapping)) {
        if (s[key]) {
          labels.forEach(label => {
            documents.push({
              type: label,
              name: `${label} Document`,
              url: s[key]
            });
          });
        }
      }

      return {
        ...s,
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        role: normalizedRole,
        originalRoleName: s.role?.name || (typeof s.role === 'string' ? s.role : 'Staff'),
        specialization: s.personal_profile?.specialization?.name || s.specialization || '',
        isActive: s.status === 'ACTIVE',
        avatar: s.profile_picture || s.avatar || '',
        salaryPaid: s.salaryPaid || 0,
        salaryPending: s.salaryPending || 0,
        documents: documents.length > 0 ? documents : (s.documents || []),
        // Map personal profile
        profitSharing: s.personal_profile?.profit_sharing || false,
        profitPercentage: s.personal_profile?.profit_percentage || 0,
        licenseNumber: s.personal_profile?.license_number || s.license_number || '',
        experience: s.personal_profile?.experience_years || s.experience || '',
        qualification: s.personal_profile?.qualification || s.qualification || '',
        consultationFee: s.personal_profile?.consultation_fee || s.consultation_fee || '',
      };
    });
  }, [apiStaff]);

  const handleDeleteStaff = async (id: string) => {
    try {
      await deleteStaffMutation({ id });
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const handleUpdateStaffStatus = async (id: string, status: "ACTIVE" | "INACTIVE") => {
    try {
      await updateStatusMutation({ id, status });
    } catch (e) {
      console.error("Status update failed", e);
    }
  };

  const handleSaveStaff = async (_staff: any) => {
    // Schedule is saved directly inside DoctorScheduleManager via useCreateDoctorScheduleMutation.
    // This handler remains for ModalRegistry compatibility (e.g. salary updates).
  };

  const handleSaveEMR = (record: any) => {
    setEmrRecords(prev => {
      const existing = prev.find(r => r.id === record.id);
      const withId = { ...record, id: record.id || `EMR-${Date.now()}` };
      return existing ? prev.map(r => r.id === record.id ? withId : r) : [...prev, withId];
    });
  };

  const handleDeleteEMR = (id: string) => {
    setEmrRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleSaveConsentForm = (form: any) => {
    setConsentForms(prev => {
      const existing = prev.find(f => f.id === form.id);
      const withId = { ...form, id: form.id || `CONSENT-${Date.now()}` };
      return existing ? prev.map(f => f.id === form.id ? withId : f) : [...prev, withId];
    });
  };

  const handleDeleteConsentForm = (id: string) => {
    setConsentForms(prev => prev.filter(f => f.id !== id));
  };

  return {
    staffMembers,
    emrRecords, setEmrRecords,
    consentForms, setConsentForms,
    handleSaveStaff, handleDeleteStaff, handleUpdateStaffStatus,
    handleSaveEMR, handleDeleteEMR,
    handleSaveConsentForm, handleDeleteConsentForm,
  };
}
