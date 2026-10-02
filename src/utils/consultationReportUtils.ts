/**
 * Backend payloads for this area arrive in several competing shapes
 * (snake_case, camelCase and nested wrappers) and are read through long `||`
 * fallback chains, so the raw payload roots stay deliberately loose.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DynamicPayload = any;

const hasText = (...values: unknown[]) =>
  values.some((value) => typeof value === "string" ? value.trim().length > 0 : Boolean(value));

const hasItems = (...values: unknown[]) =>
  values.some((value) => Array.isArray(value) && value.some((item) => item && typeof item === "object"));

/** A treatment or prescription row, inspected only for "does it have any
 *  content worth printing?". */
type ReportRow = Record<string, unknown>;

export function getConsultationReportAvailability(record: DynamicPayload) {
  const clinical = hasText(
    record?.observations_desc,
    record?.observations,
    record?.diagnosis_desc,
    record?.diagnosis,
    record?.additional_notes,
  ) || hasItems(record?.tooth_findings, record?.clinical_images, record?.images);

  const treatment = Boolean(record?.requiresTreatment || record?.requires_treatment) ||
    [record?.treatment_plans, record?.treatments, record?.treatmentPlans, record?.procedures]
    .some((items) => Array.isArray(items) && items.some((item: ReportRow) => item && (
      hasText(item.procedure, item.treatment_type, item.treatment, item.tooth, item.tooth_number) ||
      Number(item.cost || item.est_cost || 0) > 0
    )));

  const prescription = [record?.prescriptions, record?.prescription]
    .some((items) => Array.isArray(items) && items.some((item: ReportRow) => item && hasText(
      item.medicine_id,
      item.medicine_name,
      item.medicineName,
      typeof item.medicine === "string" ? item.medicine : "",
    )));

  return { clinical, treatment, prescription };
}
