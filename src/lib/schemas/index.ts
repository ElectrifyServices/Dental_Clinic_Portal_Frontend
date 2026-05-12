// ─── Centralized schema re-exports ───────────────────────────────────────────
// Import schemas from here rather than individual files for cleaner imports.
// Each domain file also exports its `z.infer` type for full type safety.

export { loginSchema, type LoginFormData } from './login.schema';
export { patientSchema, type PatientFormData } from './patient.schema';
export { appointmentSchema, type AppointmentFormData } from './appointment.schema';
export {
  staffSchema,
  staffStep1Fields,
  staffStep2Fields,
  staffStep3Fields,
  staffStep4Fields,
  type StaffFormData,
} from './staff.schema';
export {
  inventorySchema,
  restockSchema,
  type InventoryFormData,
  type RestockFormData,
} from './inventory.schema';
export { invoiceSchema, type InvoiceFormData, type InvoiceItemData } from './billing.schema';
export { treatmentSchema, type TreatmentFormData } from './treatment.schema';
export { emrSchema, type EmrFormData } from './emr.schema';
