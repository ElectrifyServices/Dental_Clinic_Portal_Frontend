const hasText = (...values: any[]) =>
  values.some((value) => typeof value === "string" ? value.trim().length > 0 : Boolean(value));

const hasItems = (...values: any[]) =>
  values.some((value) => Array.isArray(value) && value.some((item) => item && typeof item === "object"));

export function getConsultationReportAvailability(record: any) {
  const clinical = hasText(
    record?.observations_desc,
    record?.observations,
    record?.diagnosis_desc,
    record?.diagnosis,
    record?.additional_notes,
  ) || hasItems(record?.tooth_findings, record?.clinical_images, record?.images);

  const treatment = Boolean(record?.requiresTreatment || record?.requires_treatment) ||
    [record?.treatment_plans, record?.treatments, record?.treatmentPlans, record?.procedures]
    .some((items) => Array.isArray(items) && items.some((item: any) => item && (
      hasText(item.procedure, item.treatment_type, item.treatment, item.tooth, item.tooth_number) ||
      Number(item.cost || item.est_cost || 0) > 0
    )));

  const prescription = [record?.prescriptions, record?.prescription]
    .some((items) => Array.isArray(items) && items.some((item: any) => item && hasText(
      item.medicine_id,
      item.medicine_name,
      item.medicineName,
      typeof item.medicine === "string" ? item.medicine : "",
    )));

  return { clinical, treatment, prescription };
}
