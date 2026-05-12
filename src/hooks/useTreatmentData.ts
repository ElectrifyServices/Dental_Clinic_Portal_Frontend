import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useTreatmentData() {
  const [treatments, setTreatments] = useLocalStorage<any[]>('treatments', []);
  const [completedConsultations, setCompletedConsultations] = useLocalStorage<any[]>('completedConsultations', []);

  // Fix corrupted treatment costs
  useEffect(() => {
    const hasCorrupt = treatments.some(t => Number(t.cost) > 100_000_000);
    if (hasCorrupt) {
      setTreatments(prev => prev.map(t => Number(t.cost) > 100_000_000 ? { ...t, cost: 0 } : t));
    }
  }, [treatments]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveTreatment = (treatment: any) => {
    const withId = { ...treatment, id: treatment.id || `TR-${Date.now()}` };
    setTreatments(prev => {
      const existing = prev.find(t => t.id === withId.id);
      return existing ? prev.map(t => t.id === withId.id ? withId : t) : [...prev, withId];
    });
  };

  const handleUpdateConsultation = (consultation: any) => {
    setCompletedConsultations(prev => prev.map(c => c.id === consultation.id ? consultation : c));
  };

  return {
    treatments, setTreatments,
    completedConsultations, setCompletedConsultations,
    handleSaveTreatment, handleUpdateConsultation,
  };
}
