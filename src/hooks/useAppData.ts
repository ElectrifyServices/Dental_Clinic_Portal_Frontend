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
      const parsed = stored ? JSON.parse(stored) : [];
      // Deduplicate by ID
      const uniqueIds = new Set();
      return parsed.filter((p: any) => {
        if (!p.id || uniqueIds.has(p.id)) return false;
        uniqueIds.add(p.id);
        return true;
      });
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

  const [corporatePlans, setCorporatePlans] = useState<any[]>(() => {
    const stored = localStorage.getItem("corporatePlans");
    if (stored) return JSON.parse(stored);
    // Default sample plans
    return [
      {
        id: 'CORP-SAMPLE-1', name: 'Electrify Gold Health Plan', companyName: 'Tata Consultancy Services',
        code: 'Electrify-GOLD', description: 'Premium dental care for Electrify employees',
        benefits: [
          { id: 'b1', type: 'flat_discount', value: 20, description: '20% discount on all treatments' },
          { id: 'b2', type: 'free_consultations', value: 2, description: '2 free consultations per year' },
        ],
        validFrom: new Date().toISOString().split('T')[0],
        validTo: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        maxMembers: 500, currentMembers: 0, isActive: true,
        createdAt: new Date().toISOString(), createdBy: 'Super Admin', color: 'blue',
      },
      {
        id: 'CORP-SAMPLE-2', name: 'Infosys Silver Plan', companyName: 'Infosys Limited',
        code: 'INFO-SILV', description: 'Standard dental coverage for Infosys employees',
        benefits: [
          { id: 'b3', type: 'treatment_discount', value: 15, treatmentTypes: ['root-canal', 'crown', 'surgery'], description: '15% off major procedures' },
          { id: 'b4', type: 'capped_discount', value: 10, cap: 2000, description: '10% discount (max ₹2,000 per visit)' },
        ],
        validFrom: new Date().toISOString().split('T')[0],
        validTo: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        currentMembers: 0, isActive: true,
        createdAt: new Date().toISOString(), createdBy: 'Super Admin', color: 'emerald',
      },
    ];
  });

  const [corporateEmployees, setCorporateEmployees] = useState<any[]>(() => {
    const stored = localStorage.getItem("corporateEmployees");
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      // Migrate old format (companyId) to new format (corporatePlanId)
      return parsed.map((e: any) => ({
        ...e,
        id: e.id || `EMP-${Date.now()}-${Math.random()}`,
        corporatePlanId: e.corporatePlanId || e.companyId || '',
        corporatePlanName: e.corporatePlanName || '',
        isActive: e.isActive !== false,
        enrolledAt: e.enrolledAt || new Date().toISOString(),
      }));
    } catch { return []; }
  });

  // Data Migration: Ensure all doctors have a profit percentage
  useEffect(() => {
    const hasMissingData = staffMembers.some(s => (s.role === 'doctor' || s.role === 'admin') && s.profitPercentage === undefined);
    if (hasMissingData) {
      setStaffMembers(prev => prev.map(s => {
        if ((s.role === 'doctor' || s.role === 'admin') && s.profitPercentage === undefined) {
          // Find original percentage from demo data if possible
          const original = doctorsWithSchedules.find(d => d.name === s.name);
          return { ...s, profitPercentage: original?.profitPercentage || 40 };
        }
        return s;
      }));
    }
  }, [staffMembers]);

  const [consentForms, setConsentForms] = useState<any[]>(() => {
    const stored = localStorage.getItem("consentForms");
    return stored ? JSON.parse(stored) : [];
  });

  const [inventory, setInventory] = useState<any[]>(() => {
    const stored = localStorage.getItem("inventory");
    return stored ? JSON.parse(stored) : [
      { id: '1', name: 'Dental Syringes', category: 'instruments', currentStock: 25, minStock: 10, unit: 'pieces', supplier: 'DentalCorp', lastRestocked: '2024-01-10', cost: 150 },
      { id: '2', name: 'Composite Filling Material', category: 'materials', currentStock: 5, minStock: 8, unit: 'tubes', supplier: 'MedSupply', lastRestocked: '2024-01-05', cost: 2500 },
      { id: '3', name: 'Dental Gloves (Nitrile)', category: 'consumables', currentStock: 200, minStock: 50, unit: 'boxes', supplier: 'SafetyFirst', lastRestocked: '2024-01-12', cost: 800 },
      { id: '4', name: 'Local Anesthetic', category: 'medicines', currentStock: 3, minStock: 5, unit: 'vials', supplier: 'PharmaCare', lastRestocked: '2023-12-28', cost: 1200 },
      { id: '5', name: 'Dental X-Ray Films', category: 'consumables', currentStock: 50, minStock: 20, unit: 'sheets', supplier: 'ImageTech', lastRestocked: '2024-01-08', cost: 45 },
    ];
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
  
  // Data Cleanup: Fix astronomical treatment costs (typos)
  useEffect(() => {
    const hasCorruptData = treatments.some(t => Number(t.cost) > 100000000);
    if (hasCorruptData) {
      setTreatments(prev => prev.map(t => {
        if (Number(t.cost) > 100000000) {
          return { ...t, cost: 0 }; // Reset clearly wrong costs
        }
        return t;
      }));
    }
  }, [treatments]);

  useEffect(() => localStorage.setItem("staffMembers", JSON.stringify(staffMembers)), [staffMembers]);
  useEffect(() => localStorage.setItem("consentForms", JSON.stringify(consentForms)), [consentForms]);
  useEffect(() => localStorage.setItem("inventory", JSON.stringify(inventory)), [inventory]);
  useEffect(() => localStorage.setItem("corporatePlans", JSON.stringify(corporatePlans)), [corporatePlans]);
  useEffect(() => localStorage.setItem("corporateEmployees", JSON.stringify(corporateEmployees)), [corporateEmployees]);

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

  const handleBulkSavePatients = (newEmployees: any[]) => {
    setCorporateEmployees(prev => {
      // Avoid duplicates based on phone/email
      const existingEmails = new Set(prev.map(e => e.email?.toLowerCase()));
      const existingPhones = new Set(prev.map(e => e.phone));
      
      const filtered = newEmployees.filter(e => 
        !existingEmails.has(e.email?.toLowerCase()) && 
        !existingPhones.has(e.phone)
      );

      return [...prev, ...filtered];
    });
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

      // Unified Billing: Mark linked items as billed
      if (invoice.linkedItemIds && invoice.linkedItemIds.length > 0) {
        // Mark Consultations as billed
        setCompletedConsultations(prevConsults => prevConsults.map(c => {
          if (invoice.linkedItemIds.includes(c.id)) {
            return { ...c, isBilled: true };
          }
          return c;
        }));

        // Mark Treatments and their specific sessions as billed
        setTreatments(prevTreatments => prevTreatments.map(t => {
          let updatedTreatment = { ...t };
          let treatmentModified = false;

          // If the treatment itself was linked
          if (invoice.linkedItemIds.includes(t.id)) {
            updatedTreatment.isBilled = true;
            treatmentModified = true;
          }

          // If sessions were linked
          if (Array.isArray(t.sessions)) {
            const updatedSessions = t.sessions.map((s: any) => {
              if (invoice.linkedItemIds.includes(`${t.id}-${s.id}`)) {
                treatmentModified = true;
                return { ...s, isBilled: true };
              }
              return s;
            });
            if (treatmentModified) {
              updatedTreatment.sessions = updatedSessions;
            }
          }

          return treatmentModified ? updatedTreatment : t;
        }));
      }
      
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

    // Save all planned treatments from consultation
    if (consultation.treatmentPlans && consultation.treatmentPlans.length > 0) {
      const allPlans = consultation.treatmentPlans.map((plan: any) => ({
        id: `TR-${consultation.id || Date.now()}-${plan.tooth}`,
        patientId: consultation.patientId,
        patientName: consultation.patientName,
        procedure: plan.procedure,
        tooth: plan.tooth,
        date: consultation.consultationDate || new Date().toISOString().split('T')[0],
        notes: `Planned during consultation. ${consultation.treatmentPlan || ''}`,
        cost: plan.cost || 0,
        status: plan.isActive ? 'in-progress' : 'planned',
        doctorId: consultation.doctorId || '1',
        doctorName: consultation.doctorName || 'Dr. Sharma',
        sessions: plan.sessions || [],
        prescriptions: consultation.prescriptions || []
      }));

      setTreatments(prev => {
        // Filter out any existing ones with same ID to avoid duplicates
        const planIds = allPlans.map((p: any) => p.id);
        const filteredPrev = prev.filter(t => !planIds.includes(t.id));
        return [...filteredPrev, ...allPlans];
      });
    }
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

  const handleSaveConsentForm = (form: any) => {
    setConsentForms((prev) => {
      const existing = prev.find((f) => f.id === form.id);
      if (existing) return prev.map((f) => (f.id === form.id ? form : f));
      return [...prev, { ...form, id: form.id || `CONSENT-${Date.now()}` }];
    });
  };

  const handleDeleteConsentForm = (id: string) => {
    setConsentForms((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSaveInventoryItem = (item: any) => {
    setInventory((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => (i.id === item.id ? item : i));
      return [...prev, { ...item, id: item.id || `INV-${Date.now()}` }];
    });
  };

  const handleDeleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveCorporatePlan = (plan: any) => {
    setCorporatePlans(prev => {
      const existing = prev.find(p => p.id === plan.id);
      if (existing) return prev.map(p => p.id === plan.id ? plan : p);
      return [...prev, { ...plan, id: plan.id || `CORP-${Date.now()}` }];
    });
  };

  const handleDeleteCorporatePlan = (id: string) => {
    setCorporatePlans(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleCorporatePlan = (id: string) => {
    setCorporatePlans(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  // ── Employee handlers (new typed API) ──────────────────────────────────────
  const handleSaveEmployee = (emp: any) => {
    setCorporateEmployees(prev => {
      const existing = prev.find(e => e.id === emp.id);
      if (existing) return prev.map(e => e.id === emp.id ? { ...e, ...emp } : e);
      return [...prev, emp];
    });
  };

  const handleDeleteEmployee = (id: string) => {
    setCorporateEmployees(prev => prev.filter(e => e.id !== id));
    // Also clear corporatePlanId from any linked patient
    setPatients(prev => prev.map(p =>
      p.corporateMemberId === id ? { ...p, corporatePlanId: '', corporatePlanName: '', corporateMemberId: '' } : p
    ));
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

  const handleChangeEmployeePlan = (empId: string, newPlanId: string, newPlanName: string) => {
    setCorporateEmployees(prev => prev.map(e =>
      e.id === empId ? { ...e, corporatePlanId: newPlanId, corporatePlanName: newPlanName } : e
    ));
    // Also update any linked patient
    setPatients(prev => prev.map(p =>
      p.corporateMemberId === empId ? { ...p, corporatePlanId: newPlanId, corporatePlanName: newPlanName } : p
    ));
  };

  // Legacy compat
  const handleDeleteCorporateEmployee = (name: string, email: string) => {
    setCorporateEmployees(prev => prev.filter(e => !(e.name === name && e.email === email)));
  };

  const handleUpdateCorporateEmployee = (oldName: string, oldEmail: string, updatedEmp: any) => {
    setCorporateEmployees(prev => prev.map(e =>
      (e.name === oldName && e.email === oldEmail) ? { ...e, ...updatedEmp } : e
    ));
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
    handleSaveEMR, handleDeleteEMR,
    consentForms, handleSaveConsentForm, handleDeleteConsentForm,
    inventory, handleSaveInventoryItem, handleDeleteInventoryItem,
    corporatePlans,
    corporateEmployees,
    handleSaveCorporatePlan,
    handleDeleteCorporatePlan,
    handleToggleCorporatePlan,
    handleSaveEmployee,
    handleDeleteEmployee,
    handleBulkSaveEmployees,
    handleChangeEmployeePlan,
    // legacy
    handleBulkSavePatients,
    handleDeleteCorporateEmployee,
    handleUpdateCorporateEmployee,
  };
};
