import { useApiQuery } from "../useApiQuery";
import { LabWork } from "../../types";

export function normalizeLabWork(payload: any): LabWork | null {
  if (!payload) return null;
  const lw = payload?.responseObject?.data || payload?.data || payload;
  if (!lw || !lw.id) return null;

  // Patient mapping
  const patientId = lw.patient_id ?? lw.patientId ?? lw.patient?.id ?? "";
  const patientName = lw.patient?.name ?? lw.patient_name ?? lw.patientName ?? "";

  // Treatment mapping
  const treatmentId = lw.treatment_plan_id ?? lw.treatment_id ?? lw.treatmentId ?? lw.treatment?.id ?? "";
  const treatmentName = lw.treatment?.procedure ?? lw.treatment_name ?? lw.treatmentName ?? lw.treatment_plan?.procedure ?? lw.work_tooth_no ?? "";

  // Lab Name mapping
  const labName = typeof lw.lab_name === "object" && lw.lab_name !== null
    ? (lw.lab_name.name ?? "")
    : (lw.lab_name ?? lw.labName ?? lw.lab_name_display ?? "");

  const labNameId = lw.lab_name_id ?? (typeof lw.lab_name === "object" && lw.lab_name !== null ? lw.lab_name.id : "");

  // Work type / tooth mapping
  let workType = lw.work_tooth_no ?? lw.work_type ?? lw.workType ?? lw.tooth_no ?? "";
  if (Array.isArray(workType)) {
    workType = workType.join(", ");
  }

  // Units count
  const unitsCount = Number(lw.no_of_units ?? lw.units_count ?? lw.unitsCount ?? 1);

  // Warranty mapping (DB enum: 'NO_WARRANTY', 'WARRANTY_WITH_CARD', 'WARRANTY_WITHOUT_CARD')
  const hasWarranty = lw.warranty !== "NO_WARRANTY" && (lw.warranty !== undefined ? true : !!(lw.has_warranty ?? lw.hasWarranty));

  // Attachments mapping
  const attachments = (lw.documents ?? lw.attachments ?? []).map((doc: any) => ({
    id: doc.id,
    file_name: doc.file_name ?? doc.fileName ?? doc.name ?? "",
    file_url: doc.file_url ?? doc.fileUrl ?? doc.url ?? "",
    file_size: Number(doc.file_size ?? doc.fileSize ?? doc.size ?? 0),
    file_type: doc.file_type ?? doc.fileType ?? doc.type ?? "",
  }));

  return {
    id: lw.id,
    patientId,
    patientName,
    treatmentId,
    treatmentName,
    labName,
    labNameId,
    workType,
    unitsCount,
    hasWarranty,
    warrantyYears: lw.warranty_years ?? lw.warrantyYears ?? undefined,
    warrantyEndDate: (() => {
      const raw = lw.warranty_end_date ?? lw.warrantyEndDate ?? lw.warranty_valid_till ?? "";
      return raw ? raw.split("T")[0] : undefined;
    })(),
    createdDate: (() => {
      const raw = lw.created_date ?? lw.createdDate ?? lw.created_at ?? "";
      return raw ? raw.split("T")[0] : "";
    })(),
    price: Number(lw.price ?? 0),
    notes: lw.notes ?? undefined,
    attachments,
    status: (() => {
      const s = (lw.status ?? "").toUpperCase();
      if (s === "RECEIVED") return "received";
      if (s === "PAID" || s === "COMPLETED") return "paid";
      if (s === "CANCELLED" || s === "CANCEL") return "cancelled";
      return "ordered";
    })(),
  };
}

export function useLabWorkQuery(id: string, options?: any) {
  return useApiQuery<any>({
    queryKey: ["labWork", id],
    endpoint: `/labWork/${id}`,
    method: "get",
    options,
  });
}
