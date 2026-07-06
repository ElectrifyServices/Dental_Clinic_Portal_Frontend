import { useLocalStorage } from './useLocalStorage';
import { demoCorporatePlans } from '../data/demoData';
import { useCorporatePlansQuery } from './corporate/useCorporatePlansQuery';
import { CorporatePlan, PlanBenefitType } from '../types';
import { useMemo } from 'react';
import { mapProcedureLabelToKey } from '../constants/consent.constants';

export function useCorporateData(params?: { search?: string; status?: string; planType?: string; enabled?: boolean; }) {
  const [localPlans, setLocalPlans] = useLocalStorage<any[]>('corporatePlans', demoCorporatePlans);
  const [corporateEmployees, setCorporateEmployees] = useLocalStorage<any[]>('corporateEmployees', []);

  const isEnabled = useMemo(() => {
    if (params?.enabled === false) return false;
    const path = window.location.pathname;
    const allowed = path.includes('/membership') || path.includes('/patients') || path.includes('/billing') || path.includes('/patient-queue') || path.includes('/appointments') || path.includes('/dashboard');
    return allowed;
  }, [params?.enabled]);

  const { data: apiPlansData, refetch: refetchPlans, isLoading: isPlansLoading } = useCorporatePlansQuery({
    enabled: isEnabled,
    search: params?.search,
    status: params?.status,
    planType: params?.planType,
  });

  const mapBackendPlanToFrontend = (plan: any): CorporatePlan => {
    const mapHexToColor = (hex: string): string => {
      const colorMap: Record<string, string> = {
        "#3B82F6": "blue",
        "#8B5CF6": "violet",
        "#10B981": "emerald",
        "#F43F5E": "rose",
        "#F59E0B": "amber",
        "#06B6D4": "cyan",
        "#6366F1": "indigo",
        "#14B8A6": "teal",
      };
      return colorMap[hex?.toUpperCase()] || "blue";
    };

    const mapBackendBenefitType = (backendType: string): PlanBenefitType => {
      const typeMap: Record<string, PlanBenefitType> = {
        FLAT_DISCOUNT: "flat_discount",
        TREATMENT_DISCOUNT: "treatment_discount",
        FREE_CONSULTATION: "free_consultations",
        FREE_TREATMENT_SERVICE: "free_treatments",
        CAPPED_DISCOUNT: "capped_discount",
        UNLIMITED_CONSULTATION: "unlimited_consultations",
        COMPLIMENTARY_SESSION: "complimentary_session",
        PRIORITY_SCHEDULING: "priority_scheduling",
        FLUORIDE_APPLICATION: "fluoride_application",
        CUSTOM: "custom",
      };
      return typeMap[backendType] || "custom";
    };



    return {
      id: plan.id,
      name: plan.plan_name,
      companyName: plan.company_name,
      code: plan.plan_code,
      description: plan.description || "",
      validFrom: plan.valid_from ? plan.valid_from.split('T')[0] : "",
      validTo: plan.valid_till ? plan.valid_till.split('T')[0] : "",
      maxMembers: plan.max_member || plan.enrollment_cap || undefined,
      currentMembers: plan._count?.enrollments ?? plan._count?.employees ?? 0,
      isActive: plan.status === "ACTIVE",
      status: plan.status,
      createdAt: plan.created_at || new Date().toISOString(),
      createdBy: plan.created_by || "Super Admin",
      color: mapHexToColor(plan.theme_color),
      planCategory: (plan.plan_type?.toLowerCase() === 'company' ? 'corporate' : plan.plan_type?.toLowerCase() === 'individual' ? 'individual' : plan.plan_category?.toLowerCase() || 'corporate') as any,
      planType: plan.plan_type || (plan.plan_type?.toLowerCase() === 'company' ? 'COMPANY' : plan.plan_type?.toLowerCase() === 'individual' ? 'INDIVIDUAL' : 'COMPANY'),
      planTier: plan.plan_tier?.toLowerCase() as any,
      annualFee: plan.annual_fee ? Number(plan.annual_fee) : undefined,
      maxDependents: plan.family_coverage_limit ?? plan.max_dependents ?? 0,
      benefits: (plan.benefits || []).map((b: any) => {
        let customTreatmentText = "";
        const standardKeys = [
          'consultation', 'follow-up', 'xray-review', 'cleaning', 'emergency',
          'filling', 'root-canal', 'extraction', 'orthodontics', 'implants',
          'full-mouth-rehab', 'veneers-cosmetic', 'child-dentistry', 'crown',
          'denture', 'toothache', 'swelling-infection', 'broken-tooth', 'trauma-injury'
        ];
        const treatmentTypes = (b.clinical_procedures || []).map((proc: string) => {
          const key = mapProcedureLabelToKey(proc);
          if (!standardKeys.includes(key)) {
            customTreatmentText = proc;
            return 'other';
          }
          return key;
        });

        return {
          id: b.id,
          type: mapBackendBenefitType(b.type),
          value: ["FREE_CONSULTATION", "FREE_TREATMENT_SERVICE"].includes(b.type)
            ? (b.allocationCount ?? b.count ?? 0)
            : (b.discount_percentage ?? 0),
          cap: b.max_amount || undefined,
          customName: b.benifit_label || undefined,
          treatmentTypes,
          customTreatmentText,
          description: b.description || "",
        };
      }),
    };
  };

  const corporatePlans = useMemo(() => {
    let plansArray = null;
    if (Array.isArray(apiPlansData)) {
      plansArray = apiPlansData;
    } else if (apiPlansData && Array.isArray((apiPlansData as any).data)) {
      plansArray = (apiPlansData as any).data;
    } else if ((apiPlansData as any)?.data && Array.isArray((apiPlansData as any).data.data)) {
      plansArray = (apiPlansData as any).data.data;
    } else if (apiPlansData && Array.isArray((apiPlansData as any).plans)) {
      plansArray = (apiPlansData as any).plans;
    } else if ((apiPlansData as any)?.data && Array.isArray((apiPlansData as any).data.plans)) {
      plansArray = (apiPlansData as any).data.plans;
    }

    if (plansArray) return plansArray.map(mapBackendPlanToFrontend);
    // When backend is unreachable, fall back to demo/local data
    const isDemoMode = sessionStorage.getItem('demo_mode') === 'true';
    return isDemoMode ? (localPlans as CorporatePlan[]) : [];
  }, [apiPlansData, localPlans]);

  const handleSaveCorporatePlan = (plan: any) => {
    setLocalPlans(prev => {
      const existing = prev.find(p => p.id === plan.id);
      const withId = { ...plan, id: plan.id || `CORP-${Date.now()}` };
      return existing ? prev.map(p => p.id === plan.id ? withId : p) : [...prev, withId];
    });
    refetchPlans();
  };

  const handleDeleteCorporatePlan = (id: string) => {
    setLocalPlans(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleCorporatePlan = (id: string) => {
    setLocalPlans(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const handleSaveEmployee = (emp: any) => {
    setCorporateEmployees(prev => {
      const existing = prev.find(e => e.id === emp.id);
      return existing ? prev.map(e => e.id === emp.id ? { ...e, ...emp } : e) : [...prev, emp];
    });
  };

  const handleDeleteEmployee = (id: string) => {
    setCorporateEmployees(prev => prev.filter(e => e.id !== id));
  };

  const handleBulkSaveEmployees = (newEmps: any[]) => {
    setCorporateEmployees(prev => {
      const existingPhones = new Set(prev.map(e => e.phone));
      const existingEmails = new Set(prev.map(e => e.email?.toLowerCase()));
      const filtered = newEmps.filter(e =>
        !existingPhones.has(e.phone) && !existingEmails.has(e.email?.toLowerCase())
      );
      return [...prev, ...filtered];
    });
  };

  // Legacy compat handlers
  const handleDeleteCorporateEmployee = (name: string, email: string) => {
    setCorporateEmployees(prev => prev.filter(e => !(e.name === name && e.email === email)));
  };

  const handleUpdateCorporateEmployee = (oldName: string, oldEmail: string, updated: any) => {
    setCorporateEmployees(prev =>
      prev.map(e => (e.name === oldName && e.email === oldEmail) ? { ...e, ...updated } : e)
    );
  };

  const handleChangeEmployeePlan = (
    empId: string,
    newPlanId: string,
    newPlanName: string,
  ) => {
    setCorporateEmployees((prev) =>
      prev.map((e) =>
        e.id === empId
          ? { ...e, corporatePlanId: newPlanId, corporatePlanName: newPlanName }
          : e,
      ),
    );
  };

  return {
    corporatePlans, setCorporatePlans: setLocalPlans,
    corporateEmployees, setCorporateEmployees,
    handleSaveCorporatePlan, handleDeleteCorporatePlan, handleToggleCorporatePlan,
    handleSaveEmployee, handleDeleteEmployee, handleBulkSaveEmployees,
    handleDeleteCorporateEmployee, handleUpdateCorporateEmployee,
    handleChangeEmployeePlan,
    isPlansLoading,
    refetchCorporate: refetchPlans,
  };
}
