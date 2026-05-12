import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function usePatientData() {
  const [patients, setPatients] = useLocalStorage<any[]>('patients', []);

  const [queuedPatients, setQueuedPatients] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('queuedPatients');
      const parsed = stored ? JSON.parse(stored) : [];
      const seen = new Set();
      return parsed.filter((p: any) => {
        if (!p.id || seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    } catch { return []; }
  });

  const handleSavePatient = (patient: any, type?: string, parentId?: string) => {
    setPatients(prev => {
      const existing = prev.find(p => p.id === patient.id);
      const updated = {
        ...patient,
        isPerson: existing ? existing.isPerson : type === 'person',
        parentId: existing ? existing.parentId : type === 'person' ? parentId : null,
        prescriptionHistory: patient.prescriptionHistory || existing?.prescriptionHistory || [],
        documents: patient.documents || existing?.documents || [],
      };
      return existing ? prev.map(p => p.id === patient.id ? updated : p) : [...prev, updated];
    });
  };

  const handleDeletePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  const handleBulkSavePatients = (newEmployees: any[]) => {
    setPatients(prev => {
      const existingPhones = new Set(prev.map(e => e.phone));
      const existingEmails = new Set(prev.map(e => e.email?.toLowerCase()));
      const filtered = newEmployees.filter(e =>
        !existingPhones.has(e.phone) && !existingEmails.has(e.email?.toLowerCase())
      );
      return [...prev, ...filtered];
    });
  };

  return {
    patients, setPatients,
    queuedPatients, setQueuedPatients,
    handleSavePatient, handleDeletePatient, handleBulkSavePatients,
  };
}
