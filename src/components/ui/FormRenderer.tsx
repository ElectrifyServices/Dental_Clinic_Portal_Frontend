/**
 * FormRenderer — Generic field renderer driven by JSON FormField config.
 *
 * Usage:
 *   <FormRenderer
 *     field={fieldConfig}
 *     value={formData[fieldConfig.name]}
 *     onChange={(name, value) => setFormData(prev => ({ ...prev, [name]: value }))}
 *     error={errors[fieldConfig.name]}
 *     dynamicOptions={[...]}  // overrides field.options for selects
 *   />
 *
 * SectionRenderer wraps multiple FormRenderer calls for a whole form section.
 */

import React from 'react';
import type { FormField, SelectOption } from '../../config/forms/schema';
import { SearchableSelect } from './SearchableSelect';
import { Label } from "./Label";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";

// Inline label + error wrapper (replaces the deleted ./FormField module)
function FormFieldWrapper({
  label, error, className, children,
}: { label?: React.ReactNode; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      {label && (
        <Label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
          {label}
        </Label>
      )}
      {children}
      {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}

// ─── Base Tailwind classes ────────────────────────────────────────────────────
const INPUT_BASE =
  'w-full px-4 py-2 border border-border rounded-xl text-sm font-bold ' +
  'bg-background text-foreground ' +
  'focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all';

const INPUT_ERROR = 'border-destructive bg-destructive/10 focus:ring-destructive/20 focus:border-destructive';
const INPUT_DISABLED = 'opacity-60 cursor-not-allowed bg-muted/50';

// ─── Props ────────────────────────────────────────────────────────────────────
export interface FormRendererProps {
  /** Field metadata from JSON config */
  field: FormField;
  /** Current value from form state */
  value: any;
  /** Called with (fieldName, newValue) when the field changes */
  onChange: (name: string, value: any) => void;
  /** Validation error message */
  error?: string;
  /**
   * For select/radio fields: supply dynamic options here to override
   * (or supplement) the static options from JSON.
   * Useful when the list comes from API/state (e.g. patient names, doctor names).
   */
  dynamicOptions?: SelectOption[];
  /** Override disabled state regardless of field config */
  disabled?: boolean;
  /** Extra CSS class applied to the outer FormField wrapper */
  className?: string;
  /** Extra CSS class applied to the input element itself */
  inputClassName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function FormRenderer({
  field,
  value,
  onChange,
  error,
  dynamicOptions,
  disabled: disabledProp,
  className,
  inputClassName = '',
}: FormRendererProps) {
  const isDisabled = disabledProp ?? field.disabled ?? false;
  const isRequired = field.required ?? false;
  const label = isRequired ? (
    <>
      {field.label} <span className="text-destructive font-black">*</span>
    </>
  ) : (
    field.label
  );
  const options = dynamicOptions ?? field.options ?? [];

  // Compose the input class
  const inputCls = [
    INPUT_BASE,
    error ? INPUT_ERROR : '',
    isDisabled ? INPUT_DISABLED : '',
    inputClassName,
  ]
    .filter(Boolean)
    .join(' ');

  // ── Change handler factory ─────────────────────────────────────────────────
  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { type } = e.target as HTMLInputElement;
    const raw = e.target.value;
    let parsed: any = raw;
    if (field.type === 'phone') {
      parsed = raw.replace(/[a-zA-Z]/g, "");
    } else if (type === 'number') {
      parsed = raw === '' ? '' : Number(raw);
    } else if (type === 'checkbox') {
      parsed = (e.target as HTMLInputElement).checked;
    }
    onChange(field.name, parsed);
  };

  // ── Render by type ─────────────────────────────────────────────────────────
  const renderInput = () => {
    switch (field.type) {
      // ── Textarea ──────────────────────────────────────────────────────────
      case 'textarea':
        return (
          <Textarea
            name={field.name}
            value={value ?? ''}
            onChange={handleInput}
            required={isRequired}
            disabled={isDisabled}
            rows={field.rows ?? 3}
            placeholder={field.placeholder}
            className={`${inputCls} resize-none leading-relaxed`}
          />
        );

      // ── Searchable Select ─────────────────────────────────────────────────
      case 'searchable_select':
        return (
          <SearchableSelect
            value={value ?? ''}
            onChange={(val) => onChange(field.name, val)}
            options={options}
            placeholder={field.placeholder ?? "Select..."}
            disabled={isDisabled}
          />
        );

      // ── Select ────────────────────────────────────────────────────────────
      case 'select':
        return (
          <Select
            value={value ?? ''}
            onValueChange={(val) => onChange(field.name, val)}
            disabled={isDisabled}
          >
            <SelectTrigger className={inputCls}>
              <SelectValue placeholder={field.placeholder ?? "Select option..."} />
            </SelectTrigger>
            <SelectContent>
              {options.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      // ── Single Checkbox ───────────────────────────────────────────────────
      case 'checkbox':
        return (
          <Label className="flex items-center gap-3 py-1 cursor-pointer select-none">
            <input
              type="checkbox"
              name={field.name}
              checked={Boolean(value)}
              onChange={handleInput}
              disabled={isDisabled}
              className="w-4 h-4 accent-primary rounded"
            />
            <span className="text-sm font-medium text-foreground">{field.hint ?? field.label}</span>
          </Label>
        );

      // ── Radio group ───────────────────────────────────────────────────────
      case 'radio':
        return (
          <div className="flex flex-wrap gap-3 pt-1">
            {options.map(opt => (
              <Label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={handleInput}
                  disabled={isDisabled}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm font-medium">{opt.label}</span>
              </Label>
            ))}
          </div>
        );

      // ── File ──────────────────────────────────────────────────────────────
      case 'file':
        return (
          <div>
            <Input
              type="file"
              name={field.name}
              onChange={e => onChange(field.name, e.target.files)}
              disabled={isDisabled}
              className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20`}
            />
            {field.hint && (
              <p className="text-xs text-muted-foreground mt-1 font-medium">{field.hint}</p>
            )}
          </div>
        );

      // ── Hidden ────────────────────────────────────────────────────────────
      case 'hidden':
        return <Input type="hidden" name={field.name} value={value ?? ''} />;

      // ── All standard text-like inputs (text, email, phone, number, date, time, password) ──
      default: {
        const htmlType =
          field.type === 'phone' ? 'tel' : field.type;
        return (
          <Input
            type={htmlType}
            name={field.name}
            value={value ?? ''}
            onChange={handleInput}
            required={isRequired}
            disabled={isDisabled}
            placeholder={field.placeholder}
            step={field.step}
            min={field.validation?.min}
            max={field.validation?.max}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            className={inputCls}
          />
        );
      }
    }
  };

  // Checkbox type doesn't use the wrapper label (it renders its own label)
  if (field.type === 'hidden') return renderInput();
  if (field.type === 'checkbox') {
    return (
      <div className={className}>
        {renderInput()}
        {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
        {field.hint && field.type !== 'checkbox' && (
          <p className="text-xs text-muted-foreground mt-1 font-medium">{field.hint}</p>
        )}
      </div>
    );
  }

  return (
    <FormFieldWrapper label={label} error={error} className={className}>
      {renderInput()}
      {field.hint && (
        <p className="text-xs text-muted-foreground mt-1 font-medium">{field.hint}</p>
      )}
    </FormFieldWrapper>
  );
}

// ─── SectionRenderer ──────────────────────────────────────────────────────────
/**
 * Renders all fields of a FormSection in a responsive grid.
 * 
 * Usage:
 *   <SectionRenderer
 *     section={cfg.sections.find(s => s.id === 'personalInfo')}
 *     values={formData}
 *     onChange={(name, val) => setFormData(p => ({ ...p, [name]: val }))}
 *     errors={errors}
 *     dynamicOptions={{ patientName: patientOptions, doctorId: doctorOptions }}
 *     cols={2}
 *   />
 */
export interface SectionRendererProps {
  section: import('../../config/forms/schema').FormSection;
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  errors?: Record<string, string>;
  /**
   * Map of fieldName → SelectOption[] for fields whose options come from
   * runtime state rather than the JSON config.
   */
  dynamicOptions?: Record<string, SelectOption[]>;
  /** Map of fieldName → boolean to override per-field disabled state */
  disabled?: Record<string, boolean> | boolean;
  /** Default grid columns. Fields with colSpan override per-field. Defaults to 2 */
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

export function SectionRenderer({
  section,
  values,
  onChange,
  errors = {},
  dynamicOptions = {},
  disabled = false,
  cols = 2,
  className = '',
}: SectionRendererProps) {
  const colClass: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const spanClass: Record<number, string> = {
    1: 'col-span-1',
    2: 'md:col-span-2',
    3: 'md:col-span-2 lg:col-span-3',
    4: 'md:col-span-2 lg:col-span-4',
    6: 'col-span-full',
    12: 'col-span-full',
  };

  return (
    <div className={`grid gap-x-6 gap-y-4 ${colClass[cols]} ${className}`}>
      {section.fields.map(field => {
        const isFieldDisabled =
          typeof disabled === 'boolean'
            ? disabled
            : (disabled as Record<string, boolean>)[field.name] ?? false;

        const colSpanKey = field.colSpan ?? 1;
        const spanCls = spanClass[colSpanKey] ?? '';

        return (
          <FormRenderer
            key={field.name}
            field={field}
            value={values[field.name]}
            onChange={onChange}
            error={errors[field.name]}
            dynamicOptions={dynamicOptions[field.name]}
            disabled={isFieldDisabled}
            className={spanCls}
          />
        );
      })}
    </div>
  );
}
