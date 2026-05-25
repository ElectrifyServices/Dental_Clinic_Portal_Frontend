import { useEffect, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useStaffQuery } from './staff/useStaffQuery';
import { useDeleteStaffMutation } from './staff/useDeleteStaffMutation';
import { useUpdateStaffStatusMutation } from './staff/useUpdateStaffStatusMutation';
import { FILE_BASE_URL } from '../services/apiClient';

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
      let normalizedRole = 'staff';
      let rawRole = s.role?.name || s.role_id || s.role || 'staff';
      if (typeof rawRole !== 'string') rawRole = String(rawRole);
      const lowerRole = rawRole.toLowerCase();

      if (lowerRole.includes('super')) normalizedRole = 'super_admin';
      else if (lowerRole.includes('admin')) normalizedRole = 'admin';
      else if (lowerRole.includes('doctor')) normalizedRole = 'doctor';
      else if (lowerRole.includes('reception')) normalizedRole = 'receptionist';
      else if (lowerRole.includes('nurse')) normalizedRole = 'nurse';
      else if (lowerRole.includes('assist')) normalizedRole = 'assistant';
      else normalizedRole = 'staff';

      // Construct documents array from API fields
      const documents: any[] = [];
      if (Array.isArray(s.files)) {
        
        s.files.forEach((file: any) => {
          let uiType = file.category || "Unknown";
          const cat = file.category?.toUpperCase() || "";
          
          if (cat === "ADHAR_CARD" || cat === "AADHAR_CARD") uiType = "Aadhaar / Identity Proof";
          else if (cat === "EDUCATIONAL_DEGREE" || cat === "MEDICAL_CERTIFICATE") uiType = "Educational Degree Documents";
          else if (cat === "MEDICAL_COUNCIL_REGISTRATION") uiType = "Medical Council Registration";
          else if (cat === "EXPERIENCE_CERTIFICATE" || cat === "EXPERIENCE_CERTIFICATES") uiType = "Experience Certificates";
          else if (cat === "MEDICAL_INDEMNITY_INSURANCE") uiType = "Medical Indemnity Insurance";
          else if (cat === "NOC") uiType = "NOC (if applicable)";
          else if (cat === "POLICE_VERIFICATION") uiType = "Police Verification";
          else if (cat === "PAN_CARD") uiType = "PAN Card";
          else if (cat === "BANK_DETAILS" || cat === "BANK_DETAIL") uiType = "Bank Details / Passbook";
          else if (cat === "EMPLOYMENT_CONTRACT" || cat === "SIGNED_EMPLOYMENT_CONTRACT") uiType = "Signed Employment Contract";
          else if (cat === "RESUME" || cat === "RESUME_CV") uiType = "Resume / CV";
          else if (cat === "MEDICAL_FITNESS") uiType = "Medical Fitness Certificate";
          else if (cat === "VACCINATION") uiType = "Vaccination Proof (Hep-B/COVID)";

          documents.push({
            type: uiType,
            name: file.file_name || `${uiType} Document`,
            url: file.file_url ? (file.file_url.startsWith('http') ? file.file_url : `${FILE_BASE_URL}${file.file_url}`) : ""
          });
        });
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
        department: s.personal_profile?.department || s.department || '',
        designation: s.personal_profile?.designation || s.designation || '',
        education: s.personal_profile?.education || s.education || '',
        monthlySalary: s.personal_profile?.monthly_salary || s.monthly_salary || s.personal_profile?.salary || s.salary || '',
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
