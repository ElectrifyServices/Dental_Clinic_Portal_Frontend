/**
 * usePhoneValidation — reusable hook for country-aware phone validation.
 *
 * Usage:
 *   const { phoneError, handlePhoneChange, validateOnSubmit, countryIso } =
 *     usePhoneValidation({ dialingCode: formData.country_code, onPhoneChange });
 *
 *   On submit: if (!validateOnSubmit(formData.phone)) return; // blocks submit
 */
import { useState, useMemo } from "react";
import {
  validatePhone,
  sanitizePhoneInput,
  isoFromDialingCode,
  getPhoneMaxLength,
} from "@/utils/phoneUtils";

interface UsePhoneValidationOptions {
  /** Dialing code string, e.g. "+91", "+44" */
  dialingCode: string;
  /** Called with the sanitized phone string on every keystroke */
  onPhoneChange: (sanitizedValue: string) => void;
  /** Optional: additional side-effects after value change */
  onAfterChange?: (sanitizedValue: string) => void;
}

export function usePhoneValidation({
  dialingCode,
  onPhoneChange,
  onAfterChange,
}: UsePhoneValidationOptions) {
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined);

  /** ISO code derived from dialing code — recalculated when dialingCode changes */
  const countryIso = useMemo(
    () => isoFromDialingCode(dialingCode),
    [dialingCode]
  );

  /** Max digit count for the current country's national number */
  const maxLength = useMemo(() => getPhoneMaxLength(countryIso), [countryIso]);

  /**
   * Use this as the onChange handler for the phone <input>.
   * Strips non-digits, enforces country max length, updates form state, and clears any existing error.
   */
  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const sanitized = sanitizePhoneInput(e.target.value).slice(0, maxLength);
    setPhoneError(undefined); // clear error while typing
    onPhoneChange(sanitized);
    onAfterChange?.(sanitized);
  };

  /**
   * Call this on form submit.
   * Returns true if valid, false if not (and sets the error message).
   */
  const validateOnSubmit = (phone: string): boolean => {
    const result = validatePhone(phone, countryIso);
    if (!result.isValid) {
      setPhoneError(result.errorMessage);
      return false;
    }
    setPhoneError(undefined);
    return true;
  };

  /** Manually clear the error (e.g. when country code changes) */
  const clearPhoneError = () => setPhoneError(undefined);

  return {
    phoneError,
    countryIso,
    maxLength,
    handlePhoneChange,
    validateOnSubmit,
    clearPhoneError,
  };
}
