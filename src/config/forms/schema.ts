// ─── Form Configuration Schema Types ─────────────────────────────────────────
// JSON-driven form metadata. Forms read labels, options, validation, and layout
// from their config file — so changes don't require touching component code.
// ─────────────────────────────────────────────────────────────────────────────

export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'time'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'password'
  | 'hidden';

export interface SelectOption {
  value: string;
  label: string;
  /** Arbitrary extra data (e.g. fee, color) */
  [key: string]: any;
}

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  message?: string;
}

export interface FormField {
  /** Matches the formData key / HTML name attribute */
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  /** Whether this field is required (shorthand for validation.required) */
  required?: boolean;
  /** Static select / radio options. Omit for dynamically populated selects. */
  options?: SelectOption[];
  /** Default value used when initialising the form state */
  defaultValue?: string | number | boolean;
  validation?: FieldValidation;
  /** For textarea rows */
  rows?: number;
  /** For number inputs */
  step?: number;
  /** Whether this field is disabled */
  disabled?: boolean;
  /** Helper hint shown below the input */
  hint?: string;
  /** Column span within a 12-column grid (1–12). Defaults to 6. */
  colSpan?: number;
}

export interface FormSection {
  id: string;
  title: string;
  /** Lucide icon name (string). The form component resolves this to the component. */
  icon?: string;
  /** Ordered list of fields in this section */
  fields: FormField[];
}

export interface FormStep {
  /** Step number (1-based) */
  number: number;
  title: string;
  icon?: string;
  sections: FormSection[];
}

/** Title variants for create vs edit vs other contexts */
export interface FormTitles {
  create: string;
  edit: string;
  [variant: string]: string;
}

export interface FormConfig {
  /** Unique form ID — matches the JSON filename without extension */
  formId: string;
  version: string;
  /** Modal / page title by context */
  title: FormTitles;
  /**
   * For single-step forms use `sections`.
   * For multi-step wizard forms use `steps`.
   */
  sections?: FormSection[];
  steps?: FormStep[];
  /** Submit button labels by context */
  submitLabel?: { create: string; edit: string; [k: string]: string };
  /** Cancel button label */
  cancelLabel?: string;
}
