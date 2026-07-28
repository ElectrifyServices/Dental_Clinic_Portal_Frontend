import { LabWork } from "../../types";

export function normalizeLabWork(payload: any): LabWork | null {
  if (!payload) return null;
  const lw = payload?.responseObject?.data || payload?.data || payload;
  if (!lw || !lw.id) return null;

  return {
    id: lw.id,
    patientId: lw.patient_id ?? lw.patientId ?? (lw.patient?.id) ?? "",
    patientName: lw.patient_name ?? lw.patientName ?? (lw.patient?.name) ?? "",
    labName: lw.lab_name ?? lw.labName ?? "",
    workType: lw.work_type ?? lw.workType ?? lw.tooth_no ?? lw.toothNo ?? "",
    unitsCount: Number(lw.units_count ?? lw.unitsCount ?? 1),
    hasWarranty: !!(lw.has_warranty ?? lw.hasWarranty),
    warrantyYears: lw.warranty_years ?? lw.warrantyYears ?? undefined,
    warrantyEndDate: lw.warranty_end_date ?? lw.warrantyEndDate ?? undefined,
    createdDate: lw.created_date ?? lw.createdDate ?? (lw.created_at ? lw.created_at.split("T")[0] : ""),
    price: Number(lw.price ?? 0),
    status: (lw.status ?? "ordered").toLowerCase(),
  };
}
