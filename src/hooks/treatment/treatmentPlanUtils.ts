import { CreateTreatmentPlanVariables, TreatmentPlanResponse } from "./useCreateTreatmentPlanMutation";
import { UpdateTreatmentPlanVariables } from "./useUpdateTreatmentPlanMutation";

export function apiStatusToUi(status: string) {
  const map: Record<string, string> = {
    PLANNED: "planned",
    IN_PROGRESS: "in-progress",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
  };
  return map[status] ?? "planned";
}

export function uiStatusToApi(status: string): "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" {
  const map: Record<string, any> = {
    planned: "PLANNED",
    "in-progress": "IN_PROGRESS",
    completed: "COMPLETED",
    cancelled: "CANCELLED",
  };
  return map[status] ?? "PLANNED";
}

export function apiPrescToUi(p: any) {
  return {
    id: p.id,
    medicine: p.medicine_name,
    dosage: p.dosage,
    timing: p.timing,
    frequency: p.frequency,
    duration: `${p.duration} ${p.duration_type?.toLowerCase() ?? ""}`,
    qty: String(p.qty),
    instructions: p.instructions ?? "",
  };
}

export function apiSessionToUi(s: any) {
  return {
    id: s.id,
    sessionNumber: s.visit_number,
    date: s.visit_date ?? "",
    status: s.status?.toLowerCase().replace("_", "-") ?? "scheduled",
    notes: s.clinical_objectives ?? "",
    appointmentId: s.appointment_id ?? "",
    duration: s.duration_min ?? 45,
    cost: Number(s.session_fee ?? 0),
  };
}

export function toUiTreatment(plan: TreatmentPlanResponse) {
  return {
    id: plan.id,
    patientName: plan.patient?.name ?? "",
    patientId: plan.patient_id,
    procedure: plan.procedure,
    tooth: plan.tooth_number ? String(plan.tooth_number) : "—",
    doctorName: (plan.doctor as any)?.name || plan.doctor?.staff?.name || (plan.doctor as any)?.personal_profile?.staff?.name || (plan as any).doctorName || (plan as any).doctor_name || "",
    doctorId: plan.doctor_id,
    date: plan.treatment_date || (plan as any).treatmentDate || (plan as any).date || plan.created_at || "",
    cost: Number(plan.est_cost ?? 0),
    status: apiStatusToUi(plan.status),
    nextAppointment: plan.next_appointment ?? "",
    notes: plan.clinical_notes ?? "",
    prescriptions: (plan.prescriptions ?? []).map(apiPrescToUi),
    sessions: (plan.sessions ?? []).map(apiSessionToUi),
  };
}

export function toApiCreatePlan(formData: any): CreateTreatmentPlanVariables {
  const prescriptions = (formData.prescriptions ?? [])
    .filter((p: any) => p.medicine?.trim())
    .map((p: any) => ({
      medicine_name: p.medicine,
      dosage: p.dosage,
      timing: p.timing,
      frequency: p.frequency,
      duration: parseInt(p.duration) || 1,
      duration_type: "DAYS" as const,
      qty: parseInt(p.qty) || 0,
      instructions: p.instructions ?? "",
    }));
    console.log("Sessions in formData before conversion:", formData.sessions);
  // Convert sessions to CreateTreatmentSessionDto format
  const sessions = (formData.sessions ?? [])
    .filter((s: any) => s.scheduledDate) // Only include sessions with a date
    .map((s: any) => ({
      visit_date: s.scheduledDate ? new Date(s.scheduledDate).toISOString().split('T')[0] : undefined,
      start_time: s.startTime || "09:00 AM",
      duration_min: s.duration || 45,
      session_fee: Number(s.cost) || 0,
      clinical_objectives: s.notes || "",
    }));

  const data = {
    patient_id: formData.patientId,
    doctor_id: formData.doctorId,
    tooth_number: formData.tooth ? parseInt(formData.tooth) : undefined,
    procedure: formData.procedure,
    treatment_date: new Date(formData.date).toISOString(),
    est_cost: Number(formData.cost) || 0,
    status: uiStatusToApi(formData.status),
    clinical_notes: formData.notes ?? "",
    prescriptions,
    sessions: sessions.length > 0 ? sessions : undefined,
  };
  console.log("Data being sent to API for create:", data);
  return data;
}

export function toApiUpdatePlan(formData: any): UpdateTreatmentPlanVariables {
  const prescriptions = (formData.prescriptions ?? [])
    .filter((p: any) => p.medicine?.trim())
    .map((p: any) => ({
      id: p.id?.startsWith("new-") ? undefined : p.id,
      medicine_name: p.medicine,
      dosage: p.dosage,
      timing: p.timing,
      frequency: p.frequency,
      duration: parseInt(p.duration) || 1,
      duration_type: "DAYS" as const,
      qty: parseInt(p.qty) || 0,
      instructions: p.instructions ?? "",
    }));

  // Note: For updates, sessions are typically managed separately
  // But if your UpdateTreatmentPlanDto also includes sessions, add them here
  // Since your UpdateTreatmentPlanDto doesn't have sessions field, we omit them

  return {
    id: formData.id,
    tooth_number: formData.tooth ? parseInt(formData.tooth) : undefined,
    procedure: formData.procedure,
    treatment_date: new Date(formData.date).toISOString(),
    est_cost: Number(formData.cost) || 0,
    status: uiStatusToApi(formData.status),
    clinical_notes: formData.notes ?? "",
    doctor_id: formData.doctorId,
    prescriptions,
  };
}
