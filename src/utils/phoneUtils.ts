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
