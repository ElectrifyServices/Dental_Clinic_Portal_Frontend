import { useLocalStorage } from './useLocalStorage';
import { demoCorporatePlans } from '../data/demoData';

export function useCorporateData() {
  const [corporatePlans, setCorporatePlans] = useLocalStorage<any[]>('corporatePlans', demoCorporatePlans);

  const [corporateEmployees, setCorporateEmployees] = useLocalStorage<any[]>('corporateEmployees', []);

  const handleSaveCorporatePlan = (plan: any) => {
    setCorporatePlans(prev => {
      const existing = prev.find(p => p.id === plan.id);
      const withId = { ...plan, id: plan.id || `CORP-${Date.now()}` };
      return existing ? prev.map(p => p.id === plan.id ? withId : p) : [...prev, withId];
    });
  };

  const handleDeleteCorporatePlan = (id: string) => {
    setCorporatePlans(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleCorporatePlan = (id: string) => {
    setCorporatePlans(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
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
    corporatePlans, setCorporatePlans,
    corporateEmployees, setCorporateEmployees,
    handleSaveCorporatePlan, handleDeleteCorporatePlan, handleToggleCorporatePlan,
    handleSaveEmployee, handleDeleteEmployee, handleBulkSaveEmployees,
    handleDeleteCorporateEmployee, handleUpdateCorporateEmployee,
  };
}
