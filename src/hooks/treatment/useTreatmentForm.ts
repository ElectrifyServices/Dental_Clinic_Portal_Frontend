import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { treatmentSchema, type TreatmentFormData } from "@/lib/schemas/treatment.schema";
import { treatmentTemplates } from "@/constants/treatment-template.constants";
import type { Prescription, TreatmentSession } from "@/types/treatment.types";
import { dosageMappings } from "@/constants/treatment.constants";

export function useTreatmentForm(treatment?: any, patients?: any[], allTreatments?: any[]) {
  const form = useForm<TreatmentFormData>({
    resolver: zodResolver(treatmentSchema) as any,
    defaultValues: {
      patientName: treatment?.patientName ?? "",
      patientId: treatment?.patientId ?? "",
      procedure: treatment?.procedure ?? "",
      tooth: treatment?.tooth ?? "",
      date: treatment?.date ?? new Date().toISOString().split("T")[0],
      notes: treatment?.notes ?? "",
      cost: treatment?.cost ?? 0,
      status: treatment?.status ?? "planned",
      nextAppointment: treatment?.nextAppointment ?? "",
      images: treatment?.images ?? [],
      doctorId: treatment?.doctorId ?? "1",
      doctorName: treatment?.doctorName ?? "Dr. Rajesh Sharma",
      prescriptions: [],
      sessions: [],
    },
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(
    treatment?.prescriptions?.length > 0 
      ? treatment.prescriptions 
      : [{
          id: Date.now().toString(),
          medicine: "",
          dosage: "",
          timing: "",
          frequency: "",
          duration: "",
          durationUnit: "Days",
          qty: "",
          instructions: "",
        }]
  );

  const [treatmentSessions, setTreatmentSessions] = useState<TreatmentSession[]>(
    Array.isArray(treatment?.sessions) && treatment.sessions.length > 0 
      ? treatment.sessions 
      : []
  );

  const formData = form.watch();
  const watchedProcedure = form.watch("procedure");
  const watchedDate = form.watch("date");

  
  useEffect(() => {
    if (watchedProcedure && treatmentTemplates[watchedProcedure as keyof typeof treatmentTemplates]) {
      if (treatmentSessions.length === 0 || !treatment?.id) {
        handleProcedureChange(watchedProcedure);
      }
    }
  }, [watchedProcedure]);

  
  useEffect(() => {
    if (treatmentSessions.length > 0 && watchedDate && treatmentSessions[0]?.suggestedDate !== watchedDate) {
      updateAllSessionDates(watchedDate);
    }
  }, [watchedDate]);

  const updateAllSessionDates = (baseDate: string) => {
    const template = treatmentTemplates[watchedProcedure as keyof typeof treatmentTemplates];
    if (template) {
      const baseDateObj = new Date(baseDate);
      const updatedSessions = treatmentSessions.map((session, index) => {
        const templateSession = template.sessions[index];
        if (templateSession && templateSession.gap !== undefined) {
          const sessionDate = new Date(baseDateObj);
          sessionDate.setDate(baseDateObj.getDate() + (templateSession.gap || 0));
          return {
            ...session,
            suggestedDate: sessionDate.toISOString().split("T")[0],
            scheduledDate: sessionDate.toISOString().split("T")[0],
          };
        }
        return session;
      });
      setTreatmentSessions(updatedSessions);
    }
  };

  const pendingPlans = useMemo(() => {
    if (!formData.patientName || !allTreatments || treatment) return [];
    return allTreatments.filter(
      (t: any) =>
        t.patientName === formData.patientName && t.status === "planned",
    );
  }, [formData.patientName, allTreatments, treatment]);

  const generateSessionsFromTemplate = (procedure: string, baseDate: string, totalCost: number) => {
    const template = treatmentTemplates[procedure as keyof typeof treatmentTemplates];
    if (!template) return null;

    const baseDateObj = new Date(baseDate);
    return template.sessions.map((session, index) => {
      const sessionDate = new Date(baseDateObj);
      sessionDate.setDate(baseDateObj.getDate() + (session.gap || 0));
      
      const sessionCost = Math.round(totalCost / template.sessions.length);
      
      return {
        id: `session-${Date.now()}-${index}-${Math.random()}`,
        sessionNumber: index + 1,
        name: session.name,
        description: session.description,
        suggestedDate: sessionDate.toISOString().split("T")[0],
        scheduledDate: sessionDate.toISOString().split("T")[0],
        startTime: "09:00 AM",
        duration: session.duration,
        status: "scheduled",
        isFlexible: !session.isRequired,
        isRequired: session.isRequired,
        isOptional: !session.isRequired,
        cost: sessionCost,
        isModified: false,
        notes: "",
      };
    });
  };

  const handleProcedureChange = (procedure: string) => {
    const template = treatmentTemplates[procedure as keyof typeof treatmentTemplates];
    if (template) {
      form.setValue("cost", template.totalCost);
      
      const sessions = generateSessionsFromTemplate(
        procedure, 
        form.getValues("date"), 
        template.totalCost
      );
      
      if (sessions && sessions.length > 0) {
        setTreatmentSessions(sessions);
      } else {
        setTreatmentSessions([createDefaultSession(form.getValues("date"), procedure)]);
      }
    } else {
      setTreatmentSessions([createDefaultSession(form.getValues("date"), procedure)]);
    }
  };

  const createDefaultSession = (baseDate: string, procedureName: string): TreatmentSession => {
    return {
      id: `session-${Date.now()}-${Math.random()}`,
      sessionNumber: 1,
      name: procedureName || "Treatment Session",
      description: "Single session treatment",
      suggestedDate: baseDate,
      scheduledDate: baseDate,
      startTime: "09:00 AM",
      duration: 45,
      status: "scheduled",
      isFlexible: true,
      isRequired: true,
      isOptional: false,
      cost: form.getValues("cost") || 0,
      isModified: false,
      notes: "",
    };
  };

  const handleLoadPlan = (plan: any) => {
    form.setValue("procedure", plan.procedure);
    form.setValue("tooth", plan.tooth);
    form.setValue("cost", plan.cost);
    form.setValue("notes", plan.notes);
    form.setValue("status", "in-progress");
    if (plan.patientId) form.setValue("patientId", plan.patientId);
    if (plan.prescriptions) setPrescriptions(plan.prescriptions);
    
    const sessions = generateSessionsFromTemplate(plan.procedure, form.getValues("date"), plan.cost);
    if (sessions && sessions.length > 0) {
      setTreatmentSessions(sessions);
    }
  };

  const updateSession = (id: string, updates: Partial<TreatmentSession>) => {
    setTreatmentSessions((prev) =>
      prev.map((s) => s.id === id ? { ...s, ...updates, isModified: true } : s)
    );
  };

  const addSession = () => {
    const newSessionNumber = treatmentSessions.length + 1;
    const newSession: TreatmentSession = {
      id: `session-${Date.now()}-${Math.random()}`,
      sessionNumber: newSessionNumber,
      name: `Session ${newSessionNumber}`,
      description: "Additional treatment session",
      suggestedDate: form.getValues("date"),
      scheduledDate: form.getValues("date"),
      startTime: "09:00 AM",
      duration: 45,
      status: "scheduled",
      isFlexible: true,
      isRequired: false,
      isOptional: true,
      cost: 0,
      isModified: true,
      notes: "",
    };
    setTreatmentSessions([...treatmentSessions, newSession]);
  };

  const removeSession = (id: string) => {
    setTreatmentSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const updatePrescription = (id: string, field: string, value: string) => {
    setPrescriptions((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: value };
          if (field === "dosage" && dosageMappings[value]) {
            updated.timing = dosageMappings[value].timing;
            updated.frequency = dosageMappings[value].frequency;
          }
          
          const dosageStr = updated.dosage || "";
          const durationVal = parseFloat(updated.duration) || 0;
          const durationUnit = updated.durationUnit || "Days";
          let multiplier = 1;
          if (durationUnit === "Weeks") multiplier = 7;
          else if (durationUnit === "Months") multiplier = 30;
          else if (durationUnit === "Years") multiplier = 365;

          const parts = dosageStr.split("-");
          let dosageSum = 0;
          if (parts.length === 3) {
            dosageSum = parts.reduce((sum, part) => sum + (parseFloat(part) || 0), 0);
          }
          
          if (dosageSum > 0 && durationVal > 0) {
            updated.qty = String(Math.round(dosageSum * durationVal * multiplier));
          }
          return updated;
        }
        return p;
      })
    );
  };

  const addPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      {
        id: Date.now().toString(),
        medicine: "",
        dosage: "",
        timing: "",
        frequency: "",
        duration: "",
        durationUnit: "Days",
        qty: "",
        instructions: "",
      },
    ]);
  };

  const removePrescription = (id: string) => {
    if (prescriptions.length > 1) {
      setPrescriptions((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSubmit = (onSave: (treatment: any) => void) => {
    return (data: TreatmentFormData) => {
      const submitData = {
        ...data,
        id: treatment?.id,
        prescriptions: prescriptions.filter((p) => p.medicine?.trim() !== ""),
        sessions: treatmentSessions,
        cost: parseFloat(String(data.cost)),
      };    
      onSave(submitData);
    };
  };

  return {
    form,
    formData,
    prescriptions,
    treatmentSessions,
    pendingPlans,
    handleProcedureChange,
    handleLoadPlan,
    updateSession,
    addSession,
    removeSession,
    updatePrescription,
    addPrescription,
    removePrescription,
    handleSubmit,
  };
}