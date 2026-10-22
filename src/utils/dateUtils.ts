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

/**
 * Formats a date into "DD Mon YYYY" format (e.g., "21 Oct 2026").
 * Safely parses Date objects, ISO strings, YYYY-MM-DD, DD/MM/YYYY, and MM/DD/YYYY strings.
 */
export function formatDisplayDate(input?: Date | string | number | null | undefined): string {
  if (!input) return "—";
  try {
    if (input instanceof Date) {
      return !isNaN(input.getTime())
        ? input.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "—";
    }

    if (typeof input === "string") {
      const trimmed = input.trim();
      if (!trimmed || trimmed === "null" || trimmed === "undefined" || trimmed === "—") return "—";

      // Match YYYY-MM-DD (with optional time / ISO string)
      if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        const [datePart] = trimmed.split("T");
        const [y, m, d] = datePart.split("-").map(Number);
        const parsed = new Date(y, m - 1, d);
        if (!isNaN(parsed.getTime())) {
          return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        }
      }

      // Match DD/MM/YYYY or MM/DD/YYYY
      if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(trimmed)) {
        const parts = trimmed.split("/").map(Number);
        let parsed: Date;
        if (parts[0] > 12) {
          // Definitely DD/MM/YYYY
          parsed = new Date(parts[2], parts[1] - 1, parts[0]);
        } else if (parts[1] > 12) {
          // Definitely MM/DD/YYYY
          parsed = new Date(parts[2], parts[0] - 1, parts[1]);
        } else {
          // Default to DD/MM/YYYY for standard Indian clinic format
          parsed = new Date(parts[2], parts[1] - 1, parts[0]);
          if (isNaN(parsed.getTime())) {
            parsed = new Date(trimmed);
          }
        }
        if (!isNaN(parsed.getTime())) {
          return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        }
      }

      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      }
      return trimmed;
    }

    const parsed = new Date(input);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    }
    return String(input);
  } catch {
    return String(input);
  }
}

