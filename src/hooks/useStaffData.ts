import { useEffect, useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useStaffQuery } from './staff/useStaffQuery';
import { useDeleteStaffMutation } from './staff/useDeleteStaffMutation';
import { useUpdateStaffStatusMutation } from './staff/useUpdateStaffStatusMutation';
import { FILE_BASE_URL, getFileUrl } from '../services/apiClient';
import { useQueryClient } from '@tanstack/react-query';

export function useStaffData(params?: { search?: string; role?: string }) {
  const queryClient = useQueryClient();
  const isEnabled = useMemo(() => {
    const path = window.location.pathname;
    const isExcluded = path.includes('/inventory') || path.includes('/membership');
    return !isExcluded;
  }, []);

  const { data: apiStaff, isLoading: isStaffLoading } = useStaffQuery(params, { enabled: isEnabled });
  const { mutateAsync: deleteStaffMutation } = useDeleteStaffMutation();
  const { mutateAsync: updateStatusMutation } = useUpdateStaffStatusMutation();

  const refetchStaff = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['staff'] });
  }, [queryClient]);

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
          else if (cat === "MEDICAL_INDEMNITY_INSURANCE" || cat === "MEDICAL_INDEMINITY_INSURANCE") uiType = "Medical Indemnity Insurance";
          else if (cat === "NOC") uiType = "NOC (if applicable)";
          else if (cat === "POLICE_VERIFICATION") uiType = "Police Verification";
          else if (cat === "PAN_CARD") uiType = "PAN Card";
          else if (cat === "BANK_DETAILS" || cat === "BANK_DETAIL") uiType = "Bank Details / Passbook";
          else if (cat === "EMPLOYMENT_CONTRACT" || cat === "SIGNED_EMPLOYMENT_CONTRACT") uiType = "Signed Employment Contract";
          else if (cat === "RESUME" || cat === "RESUME_CV") uiType = "Resume / CV";
          else if (cat === "MEDICAL_FITNESS") uiType = "Medical Fitness Certificate";
          else if (cat === "VACCINATION" || cat === "VACCINATION_PROOF") uiType = "Vaccination Proof (Hep-B/COVID)";
          else if (cat === "MEDICAL_FITNESS_CERTIFICATE") uiType = "Medical Fitness Certificate";

          documents.push({
            type: uiType,
            name: file.file_name || `${uiType} Document`,
            url: getFileUrl(file.file_url)
          });
        });
      }

      const paymentSummary = s.payment_summary || {};
      const monthly = s.monthlySalary !== undefined ? s.monthlySalary : (paymentSummary.base_salary ?? s.personal_profile?.monthly_salary ?? s.personal_profile?.salary ?? s.salary ?? 0);
      const paid = s.salaryPaid !== undefined ? s.salaryPaid : (paymentSummary.total_paid ?? s.salaryPaid ?? s.total_paid_salary ?? 0);
      const pending = s.salaryPending !== undefined ? s.salaryPending : (paymentSummary.pending_due ?? (s.salaryPending !== undefined ? s.salaryPending : Math.max(0, Number(monthly) - Number(paid))));

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
        avatar: getFileUrl(s.profile_picture_url) || getFileUrl(s.profile_picture) || getFileUrl(s.avatar) || '',
        salaryPaid: paid,
        salaryPending: pending,
        monthlySalary: monthly,
        documents: documents.length > 0 ? documents : (s.documents || []),
        // Map personal profile
        profitSharing: s.personal_profile?.profit_sharing || false,
        profitPercentage: s.personal_profile?.profit_sharing_percentage || 0,
        licenseNumber: s.personal_profile?.license_number || s.license_number || '',
        experience: s.personal_profile?.experience_years || s.experience || '',
        qualification: s.personal_profile?.qualification || s.qualification || '',
        consultationFee: s.personal_profile?.consultation_fee || s.consultation_fee || '',
        department: s.personal_profile?.department || s.department || '',
        designation: s.personal_profile?.designation || s.designation || '',
        education: s.personal_profile?.education || s.education || '',
      };
    });
  }, [apiStaff]);

  const handleDeleteStaff = async (id: string) => {
    try {
      await deleteStaffMutation({ id });
    } catch (e) {
    }
  };

  const handleUpdateStaffStatus = async (id: string, status: "ACTIVE" | "INACTIVE") => {
    try {
      await updateStatusMutation({ id, status });
    } catch (e) {
    }
  };

  const handleSaveStaff = async (staff: any) => {
    const queryCache = queryClient.getQueryCache();
    const staffQueries = queryCache.findAll({ queryKey: ["staff"] });

    staffQueries.forEach((query) => {
      queryClient.setQueryData(query.queryKey, (oldData: any) => {
        if (!oldData) return oldData;

        let isArray = Array.isArray(oldData);
        let rawStaffList = isArray ? oldData : (oldData?.data?.staffs || oldData?.data?.staff || oldData?.data?.data || oldData?.data || oldData?.staffs || oldData?.responseObject?.data || []);

        const updatedList = rawStaffList.map((s: any) => {
          if (s.id === staff.id) {
            const updated = { ...s, ...staff };
            if (updated.personal_profile) {
              updated.personal_profile = {
                ...updated.personal_profile,
                monthly_salary: staff.monthlySalary !== undefined ? Number(staff.monthlySalary) : updated.personal_profile.monthly_salary,
                consultation_fee: staff.consultationFee !== undefined ? Number(staff.consultationFee) : updated.personal_profile.consultation_fee,
                experience_years: staff.experience !== undefined ? Number(staff.experience) : updated.personal_profile.experience_years,
              };
            }
            return updated;
          }
          return s;
        });

        if (isArray) return updatedList;
        if (oldData?.responseObject?.data) return { ...oldData, responseObject: { ...oldData.responseObject, data: updatedList } };
        if (oldData?.data?.staffs) return { ...oldData, data: { ...oldData.data, staffs: updatedList } };
        if (oldData?.data?.staff) return { ...oldData, data: { ...oldData.data, staff: updatedList } };
        if (oldData?.data?.data) return { ...oldData, data: { ...oldData.data, data: updatedList } };
        if (oldData?.data) return { ...oldData, data: updatedList };
        if (oldData?.staffs) return { ...oldData, staffs: updatedList };
        return updatedList;
      });
    });
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
    refetchStaff,
  };
}
