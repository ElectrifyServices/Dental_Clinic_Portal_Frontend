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
  const mapUnit = (unit: string) => {
    if (!unit) return "Days";
    const u = unit.toUpperCase();
    if (u === "DAYS" || u === "DAY") return "Days";
    if (u === "WEEKS" || u === "WEEK") return "Weeks";
    if (u === "MONTHS" || u === "MONTH") return "Months";
    if (u === "YEARS" || u === "YEAR") return "Years";
    return unit;
  };

  return {
    id: p.id,
    medicine: p.medicine_id || p.medicine?.id || p.medicine_name || "",
    medicineName: p.medicine?.name || p.medicineName || p.medicine_name || "",
    dosage: p.dosage,
    timing: p.timing,
    frequency: p.frequency,
    duration: p.duration?.toString() || "",
    durationUnit: mapUnit(p.duration_type || "Days"),
    qty: String(p.qty),
    instructions: p.instructions ?? "",
  };
}

export function apiSessionToUi(s: any) {
  let formattedDate = "";
  if (s.visit_date) {
    formattedDate = s.visit_date.split("T")[0];
  }

  let startTime = s.start_time || undefined;
  if (startTime && (startTime.toUpperCase().includes("AM") || startTime.toUpperCase().includes("PM"))) {
    const match = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let hrs = parseInt(match[1], 10);
      const mins = match[2];
      const period = match[3].toUpperCase();
      if (period === "PM" && hrs < 12) hrs += 12;
      if (period === "AM" && hrs === 12) hrs = 0;
      startTime = `${String(hrs).padStart(2, "0")}:${mins}`;
    }
  } else if (startTime) {
    startTime = startTime.trim().substring(0, 5);
  }

  const normalizedStatus = s.status?.toLowerCase() ?? "scheduled";

  return {
    id: s.id,
    sessionNumber: s.visit_number,
    name: s.name || `Session ${s.visit_number}`,
    date: formattedDate,
    scheduledDate: formattedDate,
    suggestedDate: formattedDate,
    startTime: startTime,
    start_time: startTime,
    status: normalizedStatus === "scheduled" ? "scheduled" :
      normalizedStatus === "in_progress" ? "in-progress" :
        normalizedStatus === "completed" ? "completed" :
          normalizedStatus === "cancelled" ? "cancelled" : normalizedStatus,
    notes: s.clinical_objectives ?? "",
    clinical_objectives: s.clinical_objectives ?? "",
    appointmentId: s.appointment_id ?? "",
    duration: s.duration_min ?? 45,
    duration_min: s.duration_min ?? 45,
    cost: Number(s.session_fee ?? 0),
    session_fee: Number(s.session_fee ?? 0),
    workDone: s.work_done ?? "",
    work_done: s.work_done ?? "",
    findings: s.session_findings ?? "",
    session_findings: s.session_findings ?? "",
    paid_amount: Number(s.paid_amount ?? 0),
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
  const raw = firstDefined(
    plan.est_cost,
    plan.cost,
    plan.amount,
    plan.final_amount,
    plan.total_amount,
    0,
  );
  const val = Number(raw);
  return isNaN(val) ? 0 : val;
}

function normalizePaidAmount(plan: any) {
  const raw = firstDefined(
    plan.total_paid_amount,
    plan.totalPaidAmount,
    plan.paid_amount,
    plan.paidAmount,
    0
  );
  const val = Number(raw);
  return isNaN(val) ? 0 : val;
}

function normalizePendingAmount(plan: any) {
  const raw = firstDefined(
    plan.pending_amount,
    plan.pendingAmount,
    null
  );
  if (raw === null || raw === undefined || raw === "") return null;
  const val = Number(raw);
  return isNaN(val) ? 0 : val;
}

function normalizeFinalCost(plan: any) {
  const raw = firstDefined(
    plan.final_cost,
    plan.finalCost,
    null
  );
  if (raw === null || raw === undefined || raw === "") {
    const est = normalizeCost(plan);
    const disc = Number(plan.discount_amount) || 0;
    return est - disc;
  }
  const val = Number(raw);
  return isNaN(val) ? 0 : val;
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

function extractToothNumber(toothValue?: string) {
  if (!toothValue) return undefined;

  const raw = String(toothValue).trim();
  const rawLower = raw.toLowerCase();

  if (
    raw === "—" ||
    raw === "-" ||
    rawLower === "fm" ||
    rawLower === "full mouth" ||
    rawLower === "multiple teeth"
  ) {
    return undefined;
  }

  const match = raw.match(/^(\d{2})/);
  if (!match) return undefined;

  const toothNumber = parseInt(match[1], 10);
  if (Number.isNaN(toothNumber)) return undefined;

  return toothNumber;
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
    discount_type: plan.discount_type ?? plan.discountType ?? null,
    discount_value: plan.discount_value ?? plan.discountValue ?? null,
    discount_amount: plan.discount_amount ?? plan.discountAmount ?? 0,
    final_cost: normalizeFinalCost(plan),
    paid_amount: normalizePaidAmount(plan),
    pending_amount: normalizePendingAmount(plan),
  };
}

export function toApiCreatePlan(formData: any): CreateTreatmentPlanVariables {
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
    .filter((s: any) => s.scheduledDate || s.suggestedDate)
    .map((s: any) => ({
      visit_date: s.scheduledDate || s.suggestedDate,
      duration_min: s.duration || 45,
      session_fee: Number(s.cost) || 0,
      clinical_objectives: s.notes || s.description || "",
    }));

  const payload: CreateTreatmentPlanVariables = {
    patient_id: formData.patientId,
    doctor_id: formData.doctorId,
    tooth_number: extractToothNumbers(formData.tooth) || [],
    procedure: formData.procedure,
    treatment_date: new Date(formData.date).toISOString(),
    est_cost: Number(formData.cost) || 0,
    status: uiStatusToApi(formData.status),
    clinical_notes: formData.notes ?? "",
    prescriptions: prescriptions,
    sessions: sessions,
    rawFiles: formData.rawFiles ?? [],
    existingImages: formData.existingImages ?? [],
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
    .filter((s: any) => s.scheduledDate || s.suggestedDate)
    .map((s: any) => ({
      id: s.id?.startsWith("session-") ? undefined : s.id,
      visit_date: s.scheduledDate || s.suggestedDate,
      duration_min: s.duration || 45,
      session_fee: Number(s.cost) || 0,
      clinical_objectives: s.notes || s.description || "",
      status: s.status?.toUpperCase() === "SCHEDULED" ? "SCHEDULED" :
        s.status?.toUpperCase() === "IN_PROGRESS" ? "IN_PROGRESS" :
          s.status?.toUpperCase() === "COMPLETED" ? "COMPLETED" :
            s.status?.toUpperCase() === "CANCELLED" ? "CANCELLED" : "SCHEDULED",
      work_done: s.workDone,
      session_findings: s.findings,
    }));

  const updateData: UpdateTreatmentPlanVariables = {
    id: formData.id,
    tooth_number: extractToothNumbers(formData.tooth) || [],
    procedure: formData.procedure,
    treatment_date: new Date(formData.date).toISOString(),
    est_cost: Number(formData.cost) || 0,
    status: uiStatusToApi(formData.status),
    clinical_notes: formData.notes ?? "",
    doctor_id: formData.doctorId,
    prescriptions: prescriptions,
    sessions: sessions,
    rawFiles: formData.rawFiles ?? [],
    existingImages: formData.existingImages ?? [],
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

  return updateData;
}
