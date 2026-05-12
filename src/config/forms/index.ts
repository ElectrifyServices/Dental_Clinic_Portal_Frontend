// ─── Form Config Registry ─────────────────────────────────────────────────────
// Central import of all form JSON configs. Add new forms here.
// ─────────────────────────────────────────────────────────────────────────────
import { FormConfig } from './schema';
import appointmentConfig from './appointment.json';
import emrConfig from './emr.json';
import inventoryConfig from './inventory.json';
import restockConfig from './restock.json';
import invoiceConfig from './invoice.json';
import staffConfig from './staff.json';
import corporateConfig from './corporate.json';
import employeeConfig from './employee.json';

export const FORM_REGISTRY: Record<string, FormConfig> = {
  appointment: appointmentConfig as unknown as FormConfig,
  emr:         emrConfig as unknown as FormConfig,
  inventory:   inventoryConfig as unknown as FormConfig,
  restock:     restockConfig as unknown as FormConfig,
  invoice:     invoiceConfig as unknown as FormConfig,
  staff:       staffConfig as unknown as FormConfig,
  corporate:   corporateConfig as unknown as FormConfig,
  employee:    employeeConfig as unknown as FormConfig,
};

export function getFormConfig(formId: string): FormConfig {
  const cfg = FORM_REGISTRY[formId];
  if (!cfg) throw new Error(`Form config not found: "${formId}". Register it in src/config/forms/index.ts`);
  return cfg;
}

export type { FormConfig, FormField, FormSection, FormStep, SelectOption, FieldValidation } from './schema';
