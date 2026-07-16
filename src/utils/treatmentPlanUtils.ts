import { CreateTreatmentPlanVariables, TreatmentPlanResponse } from "../hooks/treatment/useCreateTreatmentPlanMutation";
import { UpdateTreatmentPlanVariables } from "../hooks/treatment/useUpdateTreatmentPlanMutation";

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
    medicine: p.medicine_id || p.medicine?.id || p.medicine_name || "",
    medicineName: p.medicine?.name || p.medicineName || p.medicine_name || "",
    dosage: p.dosage,
    timing: p.timing,
    frequency: p.frequency,
    duration: p.duration?.toString() || "",
    durationUnit: p.duration_type || "Days",
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

function firstDefined<T>(...values: T[]): T | undefined {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function normalizeToothValue(plan: any) {
  const rawTooth = firstDefined(
    plan.tooth_number,
    plan.toothNumber,
    plan.tooth,
    plan.tooth_no,
  );

  if (rawTooth === -1 || rawTooth === "-1" || rawTooth === "FM") {
    return "FM";
  }

  if (rawTooth === 0 || rawTooth === "0") {
    return "—";
  }

  return rawTooth ? String(rawTooth) : "—";
}

function normalizeDoctorName(plan: any) {
  return firstDefined(
    plan.doctor?.name,
    plan.doctor?.staff?.name,
    plan.doctor?.personal_profile?.staff?.name,
    plan.personal_profile?.staff?.name,
    plan.staff?.name,
    plan.doctorName,
    plan.doctor_name,
    plan.doctor?.full_name,
    plan.assigned_doctor_name,
    "",
  ) as string;
}

function normalizePatientName(plan: any) {
  return firstDefined(
    plan.patient?.name,
    plan.patient_name,
    plan.patientName,
    plan.name,
    plan.patient_details?.name,
    plan.appointment?.patient_name,
    "",
  ) as string;
}

function normalizePatientId(plan: any) {
  return firstDefined(
    plan.patient_id,
    plan.patient?.id,
    plan.patientId,
    plan.id,
    "",
  ) as string;
}

function normalizeProcedure(plan: any) {
  return firstDefined(
    plan.procedure,
    plan.treatment_name,
    plan.treatmentName,
    plan.name,
    "",
  ) as string;
}

function normalizeCost(plan: any) {
  return Number(firstDefined(
    plan.est_cost,
    plan.cost,
    plan.amount,
    plan.final_amount,
    plan.total_amount,
    0,
  ) ?? 0);
}

function normalizeDate(plan: any) {
  return firstDefined(
    plan.treatment_date,
    plan.treatmentDate,
    plan.date,
    plan.created_at,
    plan.createdAt,
    "",
  ) as string;
}

function normalizeNextAppointment(plan: any) {
  return firstDefined(
    plan.next_appointment,
    plan.nextAppointment,
    plan.next_session_date,
    plan.nextSessionDate,
    "",
  ) as string;
}

export function toUiTreatment(plan: TreatmentPlanResponse | any) {
  const rawStatus = plan.overall_status ?? plan.overallStatus ?? plan.status;

  return {
    id: plan.id,
    patientName: normalizePatientName(plan),
    patientId: normalizePatientId(plan),
    patientCode: plan.patient_code ?? plan.patientCode ?? plan.patient?.patient_code ?? "",
    procedure: normalizeProcedure(plan),
    tooth: normalizeToothValue(plan),
    doctorName: normalizeDoctorName(plan),
    doctorId: plan.doctor_id,
    date: normalizeDate(plan),
    cost: normalizeCost(plan),
    status: rawStatus ? apiStatusToUi(rawStatus) : "planned",
    overall_status: rawStatus,
    overallStatus: rawStatus,
    treatment_plan_count: Number(plan.treatment_plan_count ?? plan.treatmentPlanCount ?? 0),
    treatmentPlanCount: Number(plan.treatment_plan_count ?? plan.treatmentPlanCount ?? 0),
    total_sessions: Number(plan.total_sessions ?? plan.totalSessions ?? plan.sessions?.length ?? 0),
    totalSessions: Number(plan.total_sessions ?? plan.totalSessions ?? plan.sessions?.length ?? 0),
    total_treatment_cost: Number(plan.total_treatment_cost ?? plan.totalTreatmentCost ?? normalizeCost(plan)),
    totalTreatmentCost: Number(plan.total_treatment_cost ?? plan.totalTreatmentCost ?? normalizeCost(plan)),
    status_breakdown: plan.status_breakdown ?? plan.statusBreakdown ?? {},
    statusBreakdown: plan.status_breakdown ?? plan.statusBreakdown ?? {},
    phone: plan.phone ?? plan.patient?.phone ?? "",
    nextAppointment: normalizeNextAppointment(plan),
    notes: plan.clinical_notes ?? plan.notes ?? "",
    prescriptions: (plan.prescriptions ?? []).map(apiPrescToUi),
    sessions: (plan.sessions ?? []).map(apiSessionToUi),
    images: ((plan as any).attachments || (plan as any).images || []).map((a: any) => typeof a === "string" ? a : (a.file_url || a.url || a.path || "")).filter(Boolean),
    attachments: (plan as any).attachments || [],
  };
}

export function toApiCreatePlan(formData: any): CreateTreatmentPlanVariables {
  const prescriptions = (formData.prescriptions ?? [])
    .filter((p: any) => p.medicine?.trim())
    .map((p: any) => ({
      medicine_id: p.medicine,
      dosage: p.dosage,
      timing: p.timing,
      frequency: p.frequency,
      duration: parseInt(p.duration) || 1,
      duration_type: "DAYS" as const,
      qty: parseInt(p.qty) || 0,
      instructions: p.instructions ?? "",
    }));

  const sessions = (formData.sessions ?? [])
    .filter((s: any) => s.scheduledDate)
    .map((s: any) => ({
      visit_date: s.scheduledDate ? new Date(s.scheduledDate).toISOString().split("T")[0] : undefined,
      start_time: s.startTime || "09:00 AM",
      duration_min: s.duration || 45,
      session_fee: Number(s.cost) || 0,
      clinical_objectives: s.notes || "",
    }));

  return {
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
    rawFiles: formData.rawFiles ?? [],
    existingImages: formData.existingImages ?? [],
  };
}

export function toApiUpdatePlan(formData: any): UpdateTreatmentPlanVariables {
  const prescriptions = (formData.prescriptions ?? [])
    .filter((p: any) => p.medicine?.trim())
    .map((p: any) => ({
      id: p.id?.startsWith("new-") ? undefined : p.id,
      medicine_id: p.medicine,
      dosage: p.dosage,
      timing: p.timing,
      frequency: p.frequency,
      duration: parseInt(p.duration) || 1,
      duration_type: "DAYS" as const,
      qty: parseInt(p.qty) || 0,
      instructions: p.instructions ?? "",
    }));

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
    rawFiles: formData.rawFiles ?? [],
    existingImages: formData.existingImages ?? [],
  };
}
