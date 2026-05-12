import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

function cleanOldAppointments(appts: any[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return appts.filter(a => {
    const d = new Date(a.date);
    d.setHours(0, 0, 0, 0);
    return d >= today;
  });
}

export function useAppointmentData() {
  const [appointments, setAppointments] = useLocalStorage<any[]>('appointments', []);

  // Keep localStorage clean (no past appointments)
  useEffect(() => {
    const cleaned = cleanOldAppointments(appointments);
    if (cleaned.length !== appointments.length) setAppointments(cleaned);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveAppointment = (appointment: any) => {
    setAppointments(prev => {
      const existing = prev.find(a => a.id === appointment.id);
      return existing
        ? prev.map(a => a.id === appointment.id ? appointment : a)
        : [...prev, appointment];
    });
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const handleUpdateAppointmentStatus = (id: string, status: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  return {
    appointments, setAppointments,
    handleSaveAppointment, handleDeleteAppointment, handleUpdateAppointmentStatus,
  };
}
