import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { demoStaff } from '../data/demoData';
import { doctorsWithSchedules } from '../data/doctors';

export function useStaffData() {
  const [staffMembers, setStaffMembers] = useLocalStorage<any[]>('staffMembers', demoStaff);
  const [emrRecords, setEmrRecords] = useLocalStorage<any[]>('emrRecords', []);
  const [consentForms, setConsentForms] = useLocalStorage<any[]>('consentForms', []);

  // Migrate: ensure doctors have a profit percentage
  useEffect(() => {
    const needsMigration = staffMembers.some(
      s => (s.role === 'doctor' || s.role === 'admin') && s.profitPercentage === undefined
    );
    if (needsMigration) {
      setStaffMembers(prev => prev.map(s => {
        if ((s.role === 'doctor' || s.role === 'admin') && s.profitPercentage === undefined) {
          const original = doctorsWithSchedules.find(d => d.name === s.name);
          return { ...s, profitPercentage: original?.profitPercentage ?? 40 };
        }
        return s;
      }));
    }
  }, [staffMembers]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveStaff = (staff: any) => {
    setStaffMembers(prev => {
      const existing = prev.find(s => s.id === staff.id);
      return existing ? prev.map(s => s.id === staff.id ? staff : s) : [...prev, staff];
    });
  };

  const handleDeleteStaff = (id: string) => {
    setStaffMembers(prev => prev.filter(s => s.id !== id));
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
    staffMembers, setStaffMembers,
    emrRecords, setEmrRecords,
    consentForms, setConsentForms,
    handleSaveStaff, handleDeleteStaff,
    handleSaveEMR, handleDeleteEMR,
    handleSaveConsentForm, handleDeleteConsentForm,
  };
}
