import { useState, useEffect } from 'react';

export const useAppData = () => {
  const [patients, setPatients] = useState<any[]>(() => {
    const stored = localStorage.getItem("patients");
    return stored ? JSON.parse(stored) : [];
  });

  const [appointments, setAppointments] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("appointments");
      const parsed = stored ? JSON.parse(stored) : [];
      return cleanOldAppointments(parsed);
    } catch {
      return [];
    }
  });

  const [queuedPatients, setQueuedPatients] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("queuedPatients");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [invoices, setInvoices] = useState<any[]>(() => {
    const stored = localStorage.getItem("invoices");
    return stored ? JSON.parse(stored) : [];
  });

  const [treatments, setTreatments] = useState<any[]>(() => {
    const stored = localStorage.getItem("treatments");
    return stored ? JSON.parse(stored) : [];
  });

  const [emrRecords, setEmrRecords] = useState<any[]>(() => {
    const stored = localStorage.getItem("emrRecords");
    return stored ? JSON.parse(stored) : [];
  });

  const [completedConsultations, setCompletedConsultations] = useState(() => {
    const stored = localStorage.getItem("completedConsultations");
    return stored ? JSON.parse(stored) : [];
  });

  const [staffMembers, setStaffMembers] = useState<any[]>([]);

  // Helpers
  function cleanOldAppointments(appts: any[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appts.filter((a) => {
      const apptDate = new Date(a.date);
      apptDate.setHours(0, 0, 0, 0);
      return apptDate >= today;
    });
  }

  // Persistance
  useEffect(() => localStorage.setItem("patients", JSON.stringify(patients)), [patients]);
  useEffect(() => localStorage.setItem("appointments", JSON.stringify(cleanOldAppointments(appointments))), [appointments]);
  useEffect(() => localStorage.setItem("queuedPatients", JSON.stringify(queuedPatients)), [queuedPatients]);
  useEffect(() => localStorage.setItem("invoices", JSON.stringify(invoices)), [invoices]);
  useEffect(() => localStorage.setItem("treatments", JSON.stringify(treatments)), [treatments]);
  useEffect(() => localStorage.setItem("emrRecords", JSON.stringify(emrRecords)), [emrRecords]);
  useEffect(() => localStorage.setItem("completedConsultations", JSON.stringify(completedConsultations)), [completedConsultations]);

  // Invoice Overdue Logic
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let changed = false;
    const updatedInvoices = invoices.map((inv) => {
      const due = new Date(inv.dueDate);
      due.setHours(0, 0, 0, 0);
      if (inv.status !== "paid" && due < today && inv.status !== "overdue") {
        changed = true;
        return { ...inv, status: "overdue" };
      }
      return inv;
    });
    if (changed) setInvoices(updatedInvoices);
  }, [invoices]);

  // Handlers
  const handleSaveAppointment = (appointment: any) => {
    setAppointments((prev) => {
      const existing = prev.find((a) => a.id === appointment.id);
      if (existing) return prev.map((a) => (a.id === appointment.id ? appointment : a));
      return [...prev, appointment];
    });
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
  };

  const handleUpdateAppointmentStatus = (id: string, status: string) => {
    setAppointments((prev) => prev.map((apt) => (apt.id === id ? { ...apt, status } : apt)));
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    }
  };

  const handleUpdateInvoiceStatus = (id: string, status: string) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status } : inv)));
  };

  const handleSavePatient = (patient: any, type?: string, parentId?: string) => {
    setPatients((prev) => {
      const existing = prev.find((p) => p.id === patient.id);
      const updatedPatient = {
        ...patient,
        isPerson: existing ? existing.isPerson : type === "person",
        parentId: existing ? existing.parentId : type === "person" ? parentId : null,
        prescriptionHistory: patient.prescriptionHistory || existing?.prescriptionHistory || [],
        documents: patient.documents || existing?.documents || [],
      };
      if (existing) return prev.map((p) => (p.id === patient.id ? updatedPatient : p));
      return [...prev, updatedPatient];
    });
  };

  const handleDeletePatient = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveInvoice = (invoice: any) => {
    setInvoices((prev) => {
      const existing = prev.find((inv) => inv.id === invoice.id);
      if (existing) return prev.map((inv) => (inv.id === invoice.id ? invoice : inv));
      return [...prev, invoice];
    });
  };

  const handleSaveTreatment = (treatment: any) => {
    setTreatments((prev) => {
      const existing = prev.find((t) => t.id === treatment.id);
      if (existing) return prev.map((t) => (t.id === treatment.id ? treatment : t));
      return [...prev, treatment];
    });
  };

  const handleCompleteConsultation = (consultation: any) => {
    setCompletedConsultations((prev) => [...prev, consultation]);
  };

  const handleUpdateConsultation = (consultation: any) => {
    setCompletedConsultations((prev) => 
      prev.map(c => c.id === consultation.id ? consultation : c)
    );
  };

  return {
    patients, setPatients,
    appointments, setAppointments,
    queuedPatients, setQueuedPatients,
    invoices, setInvoices,
    treatments, setTreatments,
    emrRecords, setEmrRecords,
    completedConsultations, setCompletedConsultations,
    staffMembers, setStaffMembers,
    handleSaveAppointment, handleDeleteAppointment, handleUpdateAppointmentStatus,
    handleDeleteInvoice, handleUpdateInvoiceStatus,
    handleSavePatient, handleDeletePatient,
    handleSaveInvoice, handleSaveTreatment,
    handleCompleteConsultation, handleUpdateConsultation
  };
};
