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

export function convertSessionToApi(session: any) {
  return {
    visit_date: session.scheduledDate || session.suggestedDate,
    duration_min: session.duration || 45,
    clinical_objectives: session.notes || session.description || "",
  };
}

export function apiSessionToUi(s: any): TreatmentSession {
  return {
    id: s.id,
    sessionNumber: s.visit_number,
    name: s.name || `Session ${s.visit_number}`,
    description: s.clinical_objectives || "",
    suggestedDate: s.visit_date ?? "",
    scheduledDate: s.visit_date ?? "",
    startTime: s.start_time || undefined,
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

export function toUiTreatment(plan: any) {
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
    date: String(normalizeDate(plan)).split("T")[0] || "",
    cost: normalizeCost(plan),
    /** Discount fields from API */
    discount_type: plan.discount_type ?? null,
    discount_value: plan.discount_value ?? null,
    discount_amount: plan.discount_amount ?? 0,
    final_cost: plan.final_cost ?? normalizeCost(plan),
    paid_amount: plan.paid_amount ?? 0,
    status: rawStatus ? apiStatusToUi(rawStatus) : "planned",
    overall_status: rawStatus,
    overallStatus: rawStatus,
    treatment_plan_count: Number(plan.treatment_plan_count ?? plan.treatmentPlanCount ?? 0),
    treatmentPlanCount: Number(plan.treatment_plan_count ?? plan.treatmentPlanCount ?? 0),
    total_treatment_cost: Number(plan.total_treatment_cost ?? plan.totalTreatmentCost ?? normalizeCost(plan)),
    totalTreatmentCost: Number(plan.total_treatment_cost ?? plan.totalTreatmentCost ?? normalizeCost(plan)),
    status_breakdown: plan.status_breakdown ?? plan.statusBreakdown ?? {},
    statusBreakdown: plan.status_breakdown ?? plan.statusBreakdown ?? {},
    phone: plan.phone ?? plan.patient?.phone ?? "",
    nextAppointment: normalizeNextAppointment(plan),
    notes: plan.clinical_notes ?? plan.notes ?? "",
    prescriptions: (plan.prescriptions ?? []).map(apiPrescToUi),
    sessions: (plan.sessions ?? []).map(apiSessionToUi),
    attachments: plan.attachments ?? [],
  };
}

export function toApiCreatePlan(formData: any): CreateTreatmentPlanVariables {
  const extractToothNumbers = (toothStr: string): number[] | undefined => {
    if (!toothStr || toothStr === "\u2014") return undefined;
    if (toothStr === "FM") return [-1];
    // Support comma-separated multiple teeth: "11, 12"
    const parts = toothStr.split(",").map((s: string) => s.trim());
    const nums = parts
      .map((p: string) => { const m = p.match(/^(\d+)/); return m ? parseInt(m[1]) : null; })
      .filter((n: number | null): n is number => n !== null);
    return nums.length > 0 ? nums : undefined;
  };

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

  const sessions = (formData.sessions ?? [])
    .map((s: any) => ({
      visit_date: s.scheduledDate || s.suggestedDate || null,
      start_time: s.startTime || "09:00 AM",
      duration_min: s.duration || 45,
      clinical_objectives: s.notes || s.description || "",
    }));

  const payload: CreateTreatmentPlanVariables = {
    patient_id: formData.patientId,
    doctor_id: formData.doctorId,
    tooth_number: extractToothNumbers(formData.tooth),
    procedure: formData.procedure,
    treatment_date: new Date(formData.date).toISOString(),
    est_cost: Number(formData.cost) || 0,
    status: uiStatusToApi(formData.status),
    clinical_notes: formData.notes ?? "",
    prescriptions: prescriptions.length > 0 ? prescriptions : undefined,
    sessions: sessions.length > 0 ? sessions : undefined,
  };

  // Only include discount fields if discount_value is set and > 0
  if (formData.discount_value !== undefined && formData.discount_value !== null && Number(formData.discount_value) > 0) {
    payload.discount_type = "PERCENTAGE";
    payload.discount_value = Number(formData.discount_value);
  } else {
    payload.discount_type = "PERCENTAGE";
    payload.discount_value = 0;
  }

  return payload;
}

export function toApiUpdatePlan(formData: any): UpdateTreatmentPlanVariables {
  const extractToothNumbers = (toothStr: string): number[] | undefined => {
    if (!toothStr || toothStr === "\u2014") return undefined;
    if (toothStr === "FM") return [-1];
    const parts = toothStr.split(",").map((s: string) => s.trim());
    const nums = parts
      .map((p: string) => { const m = p.match(/^(\d+)/); return m ? parseInt(m[1]) : null; })
      .filter((n: number | null): n is number => n !== null);
    return nums.length > 0 ? nums : undefined;
  };

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

  const sessions = (formData.sessions ?? [])
    .map((s: any) => ({
      id: s.id?.startsWith("session-") ? undefined : s.id,
      visit_date: s.scheduledDate || s.suggestedDate || null,
      start_time: s.startTime || "09:00 AM",
      duration_min: s.duration || 45,
      clinical_objectives: s.notes || s.description || "",
      status: s.status?.toUpperCase().replace("-", "_") === "IN_PROGRESS" ? "IN_PROGRESS" :
        s.status?.toUpperCase() === "SCHEDULED" ? "SCHEDULED" :
          s.status?.toUpperCase() === "COMPLETED" ? "COMPLETED" :
            s.status?.toUpperCase() === "CANCELLED" ? "CANCELLED" : "SCHEDULED",
      work_done: s.workDone || s.work_done,
      session_findings: s.findings || s.session_findings,
    }));

  const updateData: UpdateTreatmentPlanVariables = {
    id: formData.id,
    tooth_number: extractToothNumbers(formData.tooth),
    procedure: formData.procedure,
    treatment_date: new Date(formData.date).toISOString(),
    est_cost: Number(formData.cost) || 0,
    status: uiStatusToApi(formData.status),
    clinical_notes: formData.notes ?? "",
    doctor_id: formData.doctorId,
  };

  // Only include discount fields if discount_value is set and > 0
  if (formData.discount_value !== undefined && formData.discount_value !== null && Number(formData.discount_value) > 0) {
    updateData.discount_type = "PERCENTAGE";
    updateData.discount_value = Number(formData.discount_value);
  } else {
    // Explicitly clearing discount
    updateData.discount_type = "PERCENTAGE";
    updateData.discount_value = 0;
  }

  // Removed attachment IDs if any were deleted by user
  if (formData.removedAttachmentIds?.length > 0) {
    updateData.removedAttachmentIds = formData.removedAttachmentIds;
  }

  if (prescriptions.length > 0) {
    updateData.prescriptions = prescriptions;
  }

  if (sessions.length > 0) {
    updateData.sessions = sessions;
  }

  return updateData;
}
