/**
 * Returns a date string in "YYYY-MM-DD" format using local timezone coordinates.
 * Handles Date objects, ISO strings, and standard date strings.
 */
export function getLocalDateString(input?: Date | string | null | undefined): string {
  if (!input) {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  if (input instanceof Date) {
    return `${input.getFullYear()}-${String(input.getMonth() + 1).padStart(2, "0")}-${String(input.getDate()).padStart(2, "0")}`;
  }
  if (typeof input === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      return input;
    }
    if (input.includes("T")) {
      return input.split("T")[0];
    }
    const parsed = new Date(input);
    if (!isNaN(parsed.getTime())) {
      const match = input.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
      if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
      }
      return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
    }
  }
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Adds a specific number of days to a "YYYY-MM-DD" date string in a timezone-safe and DST-safe manner.
 */
export function addDaysToLocalDateString(dateStr: string, days: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  const [y, m, d] = dateStr.split("-").map(Number);
  // Construct date at local noon (12:00) to avoid timezone offsets and DST boundaries shifting the date
  const date = new Date(y, m - 1, d, 12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
