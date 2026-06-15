import { CreateTreatmentPlanVariables } from "@/hooks/treatment/useCreateTreatmentPlanMutation";
import { UpdateTreatmentPlanVariables } from "@/hooks/treatment/useUpdateTreatmentPlanMutation";
import type { TreatmentSession } from "@/types/treatment.types";

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

// Convert UI session to API CreateTreatmentSessionDto
export function convertSessionToApi(session: any) {
  // Extract tooth number from string like "14 (Upper Right 1st Premolar)"
  const extractToothNumber = (toothStr: string) => {
    if (!toothStr) return undefined;
    const match = toothStr.match(/^(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  };

  return {
    visit_date: session.scheduledDate || session.suggestedDate,
    start_time: session.startTime || "09:00 AM",
    duration_min: session.duration || 45,
    session_fee: session.cost || 0,
    clinical_objectives: session.notes || session.description || "",
  };
}

// Convert API session to UI format
export function apiSessionToUi(s: any): TreatmentSession {
  return {
    id: s.id,
    sessionNumber: s.visit_number,
    name: s.name || `Session ${s.visit_number}`,
    description: s.clinical_objectives || "",
    suggestedDate: s.visit_date ?? "",
    scheduledDate: s.visit_date ?? "",
    startTime: s.start_time || "09:00 AM",
    duration: s.duration_min ?? 45,
    status: s.status?.toLowerCase() ?? "scheduled",
    isRequired: true,
    isOptional: false,
    isFlexible: false,
    cost: Number(s.session_fee ?? 0),
    isModified: false,
    notes: s.clinical_objectives ?? "",
    workDone: s.work_done,
    findings: s.session_findings,
    nextPlan: s.next_session_plan,
  };
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

export function toUiTreatment(plan: any) {
  return {
    id: plan.id,
    patientName: plan.patient?.name ?? "",
    patientId: plan.patient_id,
    procedure: plan.procedure,
    tooth: plan.tooth_number ? String(plan.tooth_number) : "—",
    doctorName: plan.doctor?.name || plan.doctor?.staff?.name || plan.doctor?.personal_profile?.staff?.name || plan.doctorName || plan.doctor_name || "",
    doctorId: plan.doctor_id,
    date: (plan.treatment_date || plan.treatmentDate || plan.date || plan.created_at || "").split('T')[0] || "",
    cost: Number(plan.est_cost ?? 0),
    status: apiStatusToUi(plan.status),
    nextAppointment: plan.next_appointment ?? "",
    notes: plan.clinical_notes ?? "",
    prescriptions: (plan.prescriptions ?? []).map(apiPrescToUi),
    sessions: (plan.sessions ?? []).map(apiSessionToUi),
  };
}

export function toApiCreatePlan(formData: any): CreateTreatmentPlanVariables {
  // Extract tooth number from string (e.g., "14 (Upper Right 1st Premolar)" -> 14)
  const extractToothNumber = (toothStr: string) => {
    if (!toothStr || toothStr === "—") return undefined;
    const match = toothStr.match(/^(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  };

  // Convert prescriptions to API format
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

  // Convert sessions to CreateTreatmentSessionDto format
  const sessions = (formData.sessions ?? [])
    .filter((s: any) => s.scheduledDate || s.suggestedDate)
    .map((s: any) => ({
      visit_date: s.scheduledDate || s.suggestedDate,
      start_time: s.startTime || "09:00 AM",
      duration_min: s.duration || 45,
      session_fee: s.cost || 0,
      clinical_objectives: s.notes || s.description || "",
    }));

  return {
    patient_id: formData.patientId,
    doctor_id: formData.doctorId,
    tooth_number: extractToothNumber(formData.tooth),
    procedure: formData.procedure,
    treatment_date: new Date(formData.date).toISOString(),
    est_cost: Number(formData.cost) || 0,
    status: uiStatusToApi(formData.status),
    clinical_notes: formData.notes ?? "",
    prescriptions: prescriptions.length > 0 ? prescriptions : undefined,
    sessions: sessions.length > 0 ? sessions : undefined,
  };
}

export function toApiUpdatePlan(formData: any): UpdateTreatmentPlanVariables {
  // Extract tooth number from string
  const extractToothNumber = (toothStr: string) => {
    if (!toothStr || toothStr === "—") return undefined;
    const match = toothStr.match(/^(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  };

  // Convert prescriptions to API format
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

  // Convert sessions to API format for update
  const sessions = (formData.sessions ?? [])
    .filter((s: any) => s.scheduledDate || s.suggestedDate)
    .map((s: any) => ({
      id: s.id?.startsWith("session-") ? undefined : s.id, // Only include real IDs, not temp ones
      visit_date: s.scheduledDate || s.suggestedDate,
      start_time: s.startTime || "09:00 AM",
      duration_min: s.duration || 45,
      session_fee: s.cost || 0,
      clinical_objectives: s.notes || s.description || "",
      status: s.status?.toUpperCase() === "SCHEDULED" ? "SCHEDULED" :
              s.status?.toUpperCase() === "IN_PROGRESS" ? "IN_PROGRESS" :
              s.status?.toUpperCase() === "COMPLETED" ? "COMPLETED" :
              s.status?.toUpperCase() === "CANCELLED" ? "CANCELLED" : "SCHEDULED",
      work_done: s.workDone,
      session_findings: s.findings,
      next_session_plan: s.nextPlan,
    }));

  const updateData: UpdateTreatmentPlanVariables = {
    id: formData.id,
    tooth_number: extractToothNumber(formData.tooth),
    procedure: formData.procedure,
    treatment_date: new Date(formData.date).toISOString(),
    est_cost: Number(formData.cost) || 0,
    status: uiStatusToApi(formData.status),
    clinical_notes: formData.notes ?? "",
    doctor_id: formData.doctorId,
  };

  // Only include if there are prescriptions
  if (prescriptions.length > 0) {
    updateData.prescriptions = prescriptions;
  }

  // Only include if there are sessions
  if (sessions.length > 0) {
    updateData.sessions = sessions;
  }

  return updateData;
}