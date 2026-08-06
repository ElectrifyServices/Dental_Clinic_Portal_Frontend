import React from "react";

/**
 * Prevents scientific notation characters ('e', 'E', '+', '-') and optionally decimal point ('.') in numeric inputs on key down.
 */
export const preventScientificNotation = (
  e: React.KeyboardEvent<HTMLInputElement>,
  allowDecimal = false
) => {
  const invalidKeys = allowDecimal ? ["e", "E", "+", "-"] : ["e", "E", "+", "-", "."];
  if (invalidKeys.includes(e.key)) {
    e.preventDefault();
  }
};

/**
 * Sanitizes a numeric string by:
 * 1. Removing non-digits (or non-numeric characters if allowDecimal is true)
 * 2. Removing leading zeroes when followed by non-zero digits
 * 3. Replacing multiple leading zeroes with a single zero
 */
export const sanitizeNumericString = (value: string, allowDecimal = false): string => {
  let valStr = allowDecimal ? value.replace(/[^0-9.]/g, "") : value.replace(/\D/g, "");

  if (allowDecimal) {
    const parts = valStr.split(".");
    if (parts.length > 2) {
      valStr = parts[0] + "." + parts.slice(1).join("");
    }
  }

  if (/^0+[1-9]/.test(valStr)) {
    valStr = valStr.replace(/^0+/, "");
  } else if (/^0{2,}/.test(valStr)) {
    valStr = "0";
  }
  return valStr;
};

/**
 * Helper to process numeric input change events and callback with sanitized string value.
 */
export const handleNumericChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  onChangeCallback: (e: { target: { name: string; value: string } }) => void,
  allowDecimal = false
) => {
  const valStr = sanitizeNumericString(e.target.value, allowDecimal);
  e.target.value = valStr;
  onChangeCallback({ target: { name: e.target.name, value: valStr } });
};
