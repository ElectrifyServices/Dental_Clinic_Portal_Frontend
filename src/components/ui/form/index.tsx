/**
 * Reusable RHF-integrated form field components.
 * All accept `control` + `name` from useForm and render
 * FormItem → FormLabel → FormControl → Input → FormMessage.
 *
 * Usage:
 *   const form = useForm<MySchema>({ resolver: zodResolver(schema) });
 *   <FormInput control={form.control} name="email" label="Email" type="email" />
 */

import * as React from "react";
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

import { Checkbox } from "@/components/ui/Checkbox";

// ─── Shared prop base ─────────────────────────────────────────────────────────
interface BaseFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  className?: string;
  required?: boolean;
}

// ─── FormInput ────────────────────────────────────────────────────────────────
interface FormInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>
  extends
    BaseFieldProps<TFieldValues, TName>,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "name"> {
  type?: React.HTMLInputTypeAttribute;
}

export function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  className,
  required,
  ...inputProps
}: FormInputProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input {...field} {...inputProps} value={field.value ?? ""} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ─── FormTextarea ─────────────────────────────────────────────────────────────
interface FormTextareaProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>
  extends
    BaseFieldProps<TFieldValues, TName>,
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name"> {}

export function FormTextarea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  className,
  required,
  ...textareaProps
}: FormTextareaProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Textarea {...field} {...textareaProps} value={field.value ?? ""} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ─── FormSelect ───────────────────────────────────────────────────────────────
export interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
  options: SelectOption[];
  placeholder?: string;
  selectClassName?: string;
}

export function FormSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  className,
  required,
  options,
  placeholder,
  selectClassName,
}: FormSelectProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <select
              {...field}
              value={field.value ?? ""}
              className={cn(
                "form-input w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all",
                selectClassName,
              )}
            >
              {placeholder && (
                <option value="" disabled>
                  {placeholder}
                </option>
              )}
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ─── FormCheckbox ─────────────────────────────────────────────────────────────
interface FormCheckboxProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends BaseFieldProps<TFieldValues, TName> {
  checkboxLabel?: string;
}

export function FormCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  className,
  checkboxLabel,
}: FormCheckboxProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "flex flex-row items-start space-x-3 space-y-0",
            className,
          )}
        >
          <FormControl>
            <Checkbox
              checked={!!field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {(label || checkboxLabel) && (
              <FormLabel className="cursor-pointer font-medium">
                {label || checkboxLabel}
              </FormLabel>
            )}
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

// ─── FormDateInput ────────────────────────────────────────────────────────────
export function FormDateInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  className,
  required,
  min,
  max,
}: BaseFieldProps<TFieldValues, TName> & { min?: string; max?: string }) {
  return (
    <FormInput
      control={control}
      name={name}
      label={label}
      description={description}
      className={className}
      required={required}
      type="date"
      min={min}
      max={max}
    />
  );
}

// ─── FormPhoneInput ───────────────────────────────────────────────────────────
export function FormPhoneInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  className,
  required,
}: BaseFieldProps<TFieldValues, TName>) {
  const { field } = useController({ control, name });
  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input
              {...field}
              type="tel"
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange(e.target.value.replace(/\D/g, ""))
              }
              maxLength={15}
              placeholder="98765 43210"
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
