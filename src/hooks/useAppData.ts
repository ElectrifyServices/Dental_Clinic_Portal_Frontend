import { usePatientData } from "./usePatientData";
import { useAppointmentData } from "./useAppointmentData";
import { useInvoiceData } from "./useInvoiceData";
import { useTreatmentData } from "./useTreatmentData";
import { useStaffData } from "./useStaffData";
import { useInventoryData } from "./useInventoryData";
import { useCorporateData } from "./useCorporateData";

export const useAppData = (params?: {
  search?: string;
  role?: string;
  corporateSearch?: string;
  corporateStatus?: string;
}) => {
  const patientData = usePatientData();
  const apptData = useAppointmentData();
  const invoiceData = useInvoiceData();
  const treatmentData = useTreatmentData();
  const staffData = useStaffData(params);
  const inventoryData = useInventoryData();
  const corpData = useCorporateData({
    search: params?.corporateSearch,
    status: params?.corporateStatus,
  });

  const { setPatients } = patientData;
  const { setInvoices } = invoiceData;
  const { setTreatments, setCompletedConsultations } = treatmentData;
  const { setCorporateEmployees } = corpData;

  // ── Cross-domain: Invoice saves touch patients, treatments, consultations ──
  const handleSaveInvoice = (invoice: any) => {
    setInvoices((prev) => {
      if (prev.find((inv) => inv.id === invoice.id)) {
        return prev.map((inv) => (inv.id === invoice.id ? invoice : inv));
      }
      // New invoice — update patient outstanding balance
      setPatients((pp) =>
        pp.map((p) => {
          if (p.id === invoice.patientId || p.name === invoice.patientName) {
            return {
              ...p,
              outstandingBalance:
                (p.outstandingBalance || 0) +
                (invoice.total || invoice.amount || 0),
            };
          }
          return p;
        }),
      );
      // Mark linked consultations & treatments as billed
      if (invoice.linkedItemIds?.length) {
        setCompletedConsultations((cc) =>
          cc.map((c) =>
            invoice.linkedItemIds.includes(c.id) ? { ...c, isBilled: true } : c,
          ),
        );
        setTreatments((tt) =>
          tt.map((t) => {
            let modified = false;
            let updated = { ...t };
            if (invoice.linkedItemIds.includes(t.id)) {
              updated.isBilled = true;
              modified = true;
            }
            if (Array.isArray(t.sessions)) {
              const sessions = t.sessions.map((s: any) => {
                if (invoice.linkedItemIds.includes(`${t.id}-${s.id}`)) {
                  modified = true;
                  return { ...s, isBilled: true };
                }
                return s;
              });
              if (modified) updated.sessions = sessions;
            }
            return modified ? updated : t;
          }),
        );
      }
      return [...prev, invoice];
    });
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices((prev) => {
      const inv = prev.find((i) => i.id === id);
      if (inv && inv.status !== "paid") {
        setPatients((pp) =>
          pp.map((p) => {
            if (p.id === inv.patientId || p.name === inv.patientName) {
              return {
                ...p,
                outstandingBalance: Math.max(
                  0,
                  (p.outstandingBalance || 0) - (inv.total || inv.amount || 0),
                ),
              };
            }
            return p;
          }),
        );
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleUpdateInvoiceStatus = (id: string, status: string) => {
    setInvoices((prev) => {
      const inv = prev.find((i) => i.id === id);
      if (inv && status === "paid" && inv.status !== "paid") {
        setPatients((pp) =>
          pp.map((p) => {
            if (p.id === inv.patientId || p.name === inv.patientName) {
              return {
                ...p,
                outstandingBalance: Math.max(
                  0,
                  (p.outstandingBalance || 0) - (inv.total || inv.amount || 0),
                ),
              };
            }
            return p;
          }),
        );
      }
      return prev.map((i) => (i.id === id ? { ...i, status } : i));
    });
  };

  // ── Cross-domain: Consultation completion saves treatments ──
  const handleCompleteConsultation = (consultation: any) => {
    setCompletedConsultations((prev) => [...prev, consultation]);
    if (consultation.treatmentPlans?.length) {
      const plans = consultation.treatmentPlans.map((plan: any) => ({
        id: `TR-${consultation.id || Date.now()}-${plan.tooth}`,
        patientId: consultation.patientId,
        patientName: consultation.patientName,
        procedure: plan.procedure,
        tooth: plan.tooth,
        date:
          consultation.consultationDate ||
          new Date().toISOString().split("T")[0],
        notes: `Planned during consultation. ${consultation.treatmentPlan || ""}`,
        cost: plan.cost || 0,
        status: plan.isActive ? "in-progress" : "planned",
        doctorId: consultation.doctorId || "1",
        doctorName: consultation.doctorName || "Dr. Sharma",
        sessions: plan.sessions || [],
        prescriptions: consultation.prescriptions || [],
      }));
      setTreatments((prev) => {
        const ids = new Set(plans.map((p: any) => p.id));
        return [...prev.filter((t) => !ids.has(t.id)), ...plans];
      });
    }
  };

  // ── Cross-domain: Employee deletion clears patient links ──
  const handleDeleteEmployee = (id: string) => {
    corpData.handleDeleteEmployee(id);
    setPatients((prev) =>
      prev.map((p) =>
        p.corporateMemberId === id
          ? {
              ...p,
              corporatePlanId: "",
              corporatePlanName: "",
              corporateMemberId: "",
            }
          : p,
      ),
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
    setPatients((prev) =>
      prev.map((p) =>
        p.corporateMemberId === empId
          ? { ...p, corporatePlanId: newPlanId, corporatePlanName: newPlanName }
          : p,
      ),
    );
  };

  return {
    ...patientData,
    ...apptData,
    ...invoiceData,
    ...treatmentData,
    ...staffData,
    ...inventoryData,
    ...corpData,
    // Override cross-domain handlers
    handleSaveInvoice,
    handleDeleteInvoice,
    handleUpdateInvoiceStatus,
    handleCompleteConsultation,
    handleDeleteEmployee,
    handleChangeEmployeePlan,
  };
};
