/**
 * Phone validation utilities using libphonenumber-js
 *
 * Provides country-aware phone validation — number of digits changes
 * automatically based on selected country code (ISO alpha-2).
 *
 * Existing exports like formatPhoneWithCountryCode() are preserved below.
 */
import {
  isValidPhoneNumber,
  parsePhoneNumber,
  getExampleNumber,
  AsYouType,
  type CountryCode,
} from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";

// ────────────────────────────────────────────────────────────────
// Validation
// ────────────────────────────────────────────────────────────────

export interface PhoneValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validate a phone number for the given ISO alpha-2 country code.
 *
 * @param phone  - raw national phone digits (e.g. "9876543210")
 * @param countryIso - ISO 3166-1 alpha-2 country code (e.g. "IN", "GB", "US")
 */
export function validatePhone(
  phone: string,
  countryIso: string
): PhoneValidationResult {
  if (!phone || !phone.trim()) {
    return { isValid: false, errorMessage: "Phone number is required" };
  }

  const iso = (countryIso || "IN").toUpperCase() as CountryCode;

  try {
    const valid = isValidPhoneNumber(phone, iso);
    if (!valid) {
      const example = getExampleNumber(iso, examples);
      const exampleNational = example
        ? example.formatNational()
        : "";
      return {
        isValid: false,
        errorMessage: exampleNational
          ? `Invalid phone number for selected country (e.g. ${exampleNational})`
          : "Invalid phone number for selected country",
      };
    }
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      errorMessage: "Invalid phone number format",
    };
  }
}

// ────────────────────────────────────────────────────────────────
// Placeholder / hint
// ────────────────────────────────────────────────────────────────

/**
 * Returns an example national phone number for the country
 * to use as an input placeholder.
 */
export function getPhonePlaceholder(countryIso: string): string {
  const iso = (countryIso || "IN").toUpperCase() as CountryCode;
  try {
    const example = getExampleNumber(iso, examples);
    return example ? example.formatNational() : "Phone number";
  } catch {
    return "Phone number";
  }
}

/**
 * Returns the maximum number of digits for the national phone number of a country.
 * Used to set maxLength on <input> fields dynamically.
 * e.g. India = 10, UK = 10, Iceland = 7
 */
export function getPhoneMaxLength(countryIso: string): number {
  const iso = (countryIso || "IN").toUpperCase() as CountryCode;
  try {
    const example = getExampleNumber(iso, examples);
    if (example) {
      // nationalNumber is the digits-only national number
      return example.nationalNumber.length;
    }
    return 15; // safe fallback
  } catch {
    return 15;
  }
}

// ────────────────────────────────────────────────────────────────
// Input sanitization
// ────────────────────────────────────────────────────────────────

/**
 * Strip all non-digit characters from a raw phone input string.
 * Use in onChange handlers instead of the old `.replace(/\D/g, "").slice(0, 10)` pattern.
 */
export function sanitizePhoneInput(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Format digits as the user types, using AsYouType from libphonenumber-js.
 * Optional — call in onChange for live formatting feedback.
 */
export function formatAsYouType(digits: string, countryIso: string): string {
  const iso = (countryIso || "IN").toUpperCase() as CountryCode;
  const formatter = new AsYouType(iso);
  return formatter.input(digits);
}

// ────────────────────────────────────────────────────────────────
// ISO Alpha-2 from dialing code (e.g. "+91" → "IN")
// ────────────────────────────────────────────────────────────────

import { COUNTRY_CODES_LIST } from "@/components/ui/CountryCodeSelect";

/**
 * Given a dialing code like "+91", return the ISO alpha-2 code "IN".
 * Uses the existing COUNTRY_CODES_LIST so there is a single source of truth.
 * Defaults to "IN" if no match found.
 */
export function isoFromDialingCode(dialingCode: string): string {
  if (!dialingCode) return "IN";
  const found = COUNTRY_CODES_LIST.find((c) => c.code === dialingCode);
  return found ? found.country : "IN";
}

// ────────────────────────────────────────────────────────────────
// PRESERVED — existing export (used in PatientCard, PatientTable, Step4Review etc.)
// ────────────────────────────────────────────────────────────────

/**
 * Formats a phone number with its country code and a space.
 * Examples:
 *  formatPhoneWithCountryCode("9876543210", "+91") => "+91 9876543210"
 *  formatPhoneWithCountryCode("9803332386", "+1")  => "+1 9803332386"
 *  formatPhoneWithCountryCode({ phone: "9876543210", country_code: "+91" }) => "+91 9876543210"
 */
export function formatPhoneWithCountryCode(
  phoneOrObj?: any,
  countryCode?: string
): string {
  if (!phoneOrObj && phoneOrObj !== 0) return "—";

  let rawPhone = "";
  let code = countryCode || "";

  if (typeof phoneOrObj === "object" && phoneOrObj !== null) {
    rawPhone =
      phoneOrObj.phone ||
      phoneOrObj.patient_phone ||
      phoneOrObj.patientPhone ||
      phoneOrObj.mobile ||
      "";
    code = phoneOrObj.country_code || phoneOrObj.countryCode || code;
  } else {
    rawPhone = String(phoneOrObj || "").trim();
  }

  if (!rawPhone || rawPhone === "—" || rawPhone === "-") return "—";

  // If rawPhone already starts with +
  if (rawPhone.startsWith("+")) {
    const match = rawPhone.match(/^(\+\d{1,4})\s*(.*)$/);
    if (match) {
      const parsedCode = match[1];
      const restPhone = match[2].trim();
      return `${parsedCode} ${restPhone}`;
    }
    return rawPhone;
  }

  let finalCode = (code || "+91").trim();
  if (!finalCode.startsWith("+")) {
    finalCode = `+${finalCode}`;
  }

  return `${finalCode} ${rawPhone}`;
}
