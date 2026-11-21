// ─── useFormConfig ────────────────────────────────────────────────────────────
// Returns the merged form config for the active tenant.
// Tenant configs can override any part of a form (labels, options, sections).
//
// Usage:
//   const cfg = useFormConfig('appointment');
//   const types = useFormFieldOptions('appointment', 'treatmentType');
//   const label = useFieldLabel('appointment', 'patientConcern');
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { getFormConfig } from '../config/forms';
import { FormConfig, FormField, FormSection, SelectOption } from '../config/forms/schema';

/**
 * Merges tenant-level form overrides on top of the base form config.
 * Tenant overrides live at `tenant.formOverrides.<formId>` in the tenant JSON.
 * They can patch individual field labels, options, required flags, etc.
 */
function mergeFormConfig(base: FormConfig, overrides: Partial<FormConfig> | undefined): FormConfig {
  if (!overrides) return base;

  const mergeSection = (baseSection: FormSection, overrideSection?: Partial<FormSection>): FormSection => {
    if (!overrideSection) return baseSection;
    return {
      ...baseSection,
      ...overrideSection,
      fields: baseSection.fields.map(field => {
        const ovField = (overrideSection.fields || []).find(f => f.name === field.name);
        return ovField ? { ...field, ...ovField } : field;
      }),
    };
  };

  const mergedSections = base.sections?.map(s => {
    const ovSection = overrides.sections?.find(os => os.id === s.id);
    return mergeSection(s, ovSection);
  });

  const mergedSteps = base.steps?.map(step => {
    const ovStep = overrides.steps?.find(os => os.number === step.number);
    if (!ovStep) return step;
    return {
      ...step,
      ...ovStep,
      sections: step.sections.map(s => {
        const ovSection = ovStep.sections?.find(os => os.id === s.id);
        return mergeSection(s, ovSection);
      }),
    };
  });

  return {
    ...base,
    ...overrides,
    sections: mergedSections,
    steps: mergedSteps,
  };
}

/**
 * Returns the fully-merged form config for `formId` under the active tenant.
 */
export function useFormConfig(formId: string): FormConfig {
  const { tenant } = useTenant();
  return useMemo(() => {
    const base = getFormConfig(formId);
    const overrides = (tenant as any).formOverrides?.[formId];
    return mergeFormConfig(base, overrides);
  }, [formId, tenant]);
}

/**
 * Returns all fields for a given section in a single-step form, merged flat.
 */
export function useFormSection(formId: string, sectionId: string): FormSection | undefined {
  const cfg = useFormConfig(formId);
  return cfg.sections?.find(s => s.id === sectionId);
}

/**
 * Returns a single field definition by name from any section.
 */
export function useFormField(formId: string, fieldName: string): FormField | undefined {
  const cfg = useFormConfig(formId);
  const allFields = [
    ...(cfg.sections?.flatMap(s => s.fields) ?? []),
    ...(cfg.steps?.flatMap(st => st.sections.flatMap(s => s.fields)) ?? []),
  ];
  return allFields.find(f => f.name === fieldName);
}

/**
 * Returns just the label for a specific field — handy for referencing labels
 * in form component JSX without spreading the whole field config.
 */
export function useFieldLabel(formId: string, fieldName: string, fallback = fieldName): string {
  const field = useFormField(formId, fieldName);
  return field?.label ?? fallback;
}

/**
 * Returns the options array for a select/radio field.
 * Returns `[]` if the field has no static options (dynamically populated).
 */
export function useFormFieldOptions(formId: string, fieldName: string): SelectOption[] {
  const field = useFormField(formId, fieldName);
  return field?.options ?? [];
}

/**
 * Returns the form title for a given context ('create' | 'edit' | ...).
 */
export function useFormTitle(formId: string, context: 'create' | 'edit' | string): string {
  const cfg = useFormConfig(formId);
  return cfg.title[context] ?? cfg.title.create;
}

/**
 * Returns the submit button label for a given context.
 */
export function useSubmitLabel(formId: string, context: 'create' | 'edit' | string): string {
  const cfg = useFormConfig(formId);
  return cfg.submitLabel?.[context] ?? (context === 'edit' ? 'Save Changes' : 'Submit');
}
