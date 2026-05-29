import { useLocalStorage } from './useLocalStorage';
import { demoCorporatePlans } from '../data/demoData';
import { useCorporatePlansQuery } from './corporate/useCorporatePlansQuery';
import { CorporatePlan, PlanBenefitType } from '../types';
import { useMemo } from 'react';

export function useCorporateData(params?: { search?: string; status?: string }) {
  const [localPlans, setLocalPlans] = useLocalStorage<any[]>('corporatePlans', demoCorporatePlans);
  const [corporateEmployees, setCorporateEmployees] = useLocalStorage<any[]>('corporateEmployees', []);

  const { data: apiPlansData, refetch: refetchPlans, isLoading: isPlansLoading } = useCorporatePlansQuery({
    enabled: true,
    ...params
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
        CUSTOM: "custom",
      };
      return typeMap[backendType] || "custom";
    };

    const mapProcedureLabelToKey = (label: string): string => {
      const labelMap: Record<string, string> = {
        "Consultation": "consultation",
        "Teeth Cleaning": "cleaning",
        "Dental Filling": "filling",
        "Tooth Extraction": "extraction",
        "Root Canal": "root-canal",
        "Crown Fitting": "crown",
        "Orthodontics": "orthodontics",
        "Oral Surgery": "surgery",
        "Other": "other",
      };
      return labelMap[label] || label.toLowerCase();
    };

    return {
      id: plan.id,
      name: plan.plan_name,
      companyName: plan.company_name,
      code: plan.plan_code,
      description: plan.description || "",
      validFrom: plan.valid_from ? plan.valid_from.split('T')[0] : "",
      validTo: plan.valid_till ? plan.valid_till.split('T')[0] : "",
      maxMembers: plan.max_member || undefined,
      currentMembers: plan._count?.employees || 0,
      isActive: plan.status === "ACTIVE",
      status: plan.status,
      createdAt: plan.created_at || new Date().toISOString(),
      createdBy: plan.created_by || "Super Admin",
      color: mapHexToColor(plan.theme_color),
      benefits: (plan.benefits || []).map((b: any) => ({
        id: b.id,
        type: mapBackendBenefitType(b.type),
        value: ["FREE_CONSULTATION", "FREE_TREATMENT_SERVICE"].includes(b.type)
          ? (b.count || 0)
          : (b.discount_percentage || 0),
        cap: b.max_amount || undefined,
        customName: b.benifit_label || undefined,
        treatmentTypes: (b.clinical_procedures || []).map(mapProcedureLabelToKey),
        description: b.description || "",
      })),
    };
  };

  const corporatePlans = useMemo(() => {
    let plansArray = null;
    if (Array.isArray(apiPlansData)) {
      plansArray = apiPlansData;
    } else if (apiPlansData && Array.isArray(apiPlansData.data)) {
      plansArray = apiPlansData.data;
    } else if (apiPlansData?.data && Array.isArray(apiPlansData.data.data)) {
      plansArray = apiPlansData.data.data;
    } else if (apiPlansData && Array.isArray(apiPlansData.plans)) {
      plansArray = apiPlansData.plans;
    } else if (apiPlansData?.data && Array.isArray(apiPlansData.data.plans)) {
      plansArray = apiPlansData.data.plans;
    }

    return plansArray ? plansArray.map(mapBackendPlanToFrontend) : [];
  }, [apiPlansData]);

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

  return {
    corporatePlans, setCorporatePlans: setLocalPlans,
    corporateEmployees, setCorporateEmployees,
    handleSaveCorporatePlan, handleDeleteCorporatePlan, handleToggleCorporatePlan,
    handleSaveEmployee, handleDeleteEmployee, handleBulkSaveEmployees,
    handleDeleteCorporateEmployee, handleUpdateCorporateEmployee,
    isPlansLoading,
  };
}
