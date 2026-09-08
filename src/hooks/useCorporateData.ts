import { useLocalStorage } from './useLocalStorage';
import { demoCorporatePlans } from '../data/demoData';
import { useCorporatePlansQuery } from './corporate/useCorporatePlansQuery';
import { mapBackendPlanToFrontend } from './corporate/mapBackendPlanToFrontend';
import { CorporatePlan } from '../types';
import { useMemo } from 'react';

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
    refetchOnMount: 'always',
  });

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
