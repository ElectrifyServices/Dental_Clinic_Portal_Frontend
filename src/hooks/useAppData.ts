import { useState, useEffect } from 'react';
import { doctorsWithSchedules } from '../data/doctors';

const demoStaff = [
  ...doctorsWithSchedules.map(d => ({
    ...d,
    role: d.id === '1' ? 'admin' : 'doctor',
    email: `${d.name.split(' ')[1].toLowerCase()}@clinic.com`,
    phone: `+91 ${Math.floor(10000 + Math.random() * 90000)} ${Math.floor(10000 + Math.random() * 90000)}`,
    permissions: d.id === '1' ? ['all'] : ['appointments', 'patients', 'treatments', 'emr'],
    isActive: true,
    avatar: d.image,
    salaryPaid: '15,000',
    salaryPending: '15,000'
  })),
  {
    id: '4',
    name: 'Sarah Johnson',
    email: 'sarah@clinic.com',
    role: 'receptionist',
    phone: '+91 65432 10987',
    permissions: ['appointments', 'patients'],
    isActive: true,
    salaryPaid: '12,000',
    salaryPending: '8,000',
    workingHours: {
      monday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      tuesday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      wednesday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      thursday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      friday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      saturday: { isWorking: true, startTime: '08:00', endTime: '14:00' },
      sunday: { isWorking: false, startTime: '08:00', endTime: '17:00' }
    }
  },
  {
    id: '5',
    name: 'Michael Chen',
    email: 'michael@clinic.com',
    role: 'assistant',
    specialization: 'Dental Assistant',
    phone: '+91 54321 09876',
    permissions: ['appointments', 'patients', 'inventory'],
    isActive: false,
    salaryPaid: '10,000',
    salaryPending: '5,000',
    workingHours: {
      monday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      thursday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      friday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      saturday: { isWorking: false, startTime: '09:00', endTime: '18:00' },
      sunday: { isWorking: false, startTime: '09:00', endTime: '18:00' }
    }
  }
];

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

  const [staffMembers, setStaffMembers] = useState<any[]>(() => {
    const stored = localStorage.getItem("staffMembers");
    return stored ? JSON.parse(stored) : demoStaff;
  });

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
  useEffect(() => localStorage.setItem("staffMembers", JSON.stringify(staffMembers)), [staffMembers]);

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
      setInvoices((prev) => {
        const invoice = prev.find(inv => inv.id === id);
        if (invoice && invoice.status !== 'paid') {
          // Decrease patient outstanding balance because the debt is removed
          setPatients(prevPatients => prevPatients.map(p => {
            if (p.id === invoice.patientId || p.name === invoice.patientName) {
              return {
                ...p,
                outstandingBalance: Math.max(0, (p.outstandingBalance || 0) - (invoice.total || invoice.amount || 0))
              };
            }
            return p;
          }));
        }
        return prev.filter((inv) => inv.id !== id);
      });
    }
  };

  const handleUpdateInvoiceStatus = (id: string, status: string) => {
    setInvoices((prev) => {
      const invoice = prev.find(inv => inv.id === id);
      if (invoice && status === 'paid' && invoice.status !== 'paid') {
        // Decrease patient outstanding balance
        setPatients(prevPatients => prevPatients.map(p => {
          if (p.id === invoice.patientId || p.name === invoice.patientName) {
            return {
              ...p,
              outstandingBalance: Math.max(0, (p.outstandingBalance || 0) - (invoice.total || invoice.amount || 0))
            };
          }
          return p;
        }));
      }
      return prev.map((inv) => (inv.id === id ? { ...inv, status } : inv));
    });
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
      if (existing) {
        // If updating an existing invoice, we might need to adjust balance, 
        // but for simplicity we'll just update the invoice.
        return prev.map((inv) => (inv.id === invoice.id ? invoice : inv));
      }
      
      // For new invoice, increase patient outstanding balance
      setPatients(prevPatients => prevPatients.map(p => {
        if (p.id === invoice.patientId || p.name === invoice.patientName) {
          return {
            ...p,
            outstandingBalance: (p.outstandingBalance || 0) + (invoice.total || invoice.amount || 0)
          };
        }
        return p;
      }));
      
      return [...prev, invoice];
    });
  };

  const handleSaveTreatment = (treatment: any) => {
    const treatmentWithId = {
      ...treatment,
      id: treatment.id || `TR-${Date.now()}`
    };
    setTreatments((prev) => {
      const existing = prev.find((t) => t.id === treatmentWithId.id);
      if (existing) return prev.map((t) => (t.id === treatmentWithId.id ? treatmentWithId : t));
      return [...prev, treatmentWithId];
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

  const handleSaveStaff = (staff: any) => {
    setStaffMembers((prev) => {
      const existing = prev.find((s) => s.id === staff.id);
      if (existing) return prev.map((s) => (s.id === staff.id ? staff : s));
      return [...prev, staff];
    });
  };

  const handleDeleteStaff = (id: string) => {
    setStaffMembers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveEMR = (record: any) => {
    setEmrRecords((prev) => {
      const existing = prev.find((r) => r.id === record.id);
      if (existing) return prev.map((r) => (r.id === record.id ? record : r));
      return [...prev, { ...record, id: record.id || `EMR-${Date.now()}` }];
    });
  };

  const handleDeleteEMR = (id: string) => {
    setEmrRecords((prev) => prev.filter((r) => r.id !== id));
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
    handleCompleteConsultation, handleUpdateConsultation,
    handleSaveStaff, handleDeleteStaff,
    handleSaveEMR, handleDeleteEMR
  };
};
