import type { ApiAny } from "../types/api";

/**
 * Standardizes a doctor's name into a clean "Dr. <Name>" display format.
 * Returns an empty string if the name is empty or a placeholder like "-", "—", "N/A", "null", "undefined", or "Dr. -".
 */
export const formatDoctorDisplayName = (rawName?: string | null): string => {
  if (!rawName) return "";
  const trimmed = String(rawName).trim();
  if (
    !trimmed ||
    trimmed === "-" ||
    trimmed === "—" ||
    trimmed === "N/A" ||
    trimmed === "null" ||
    trimmed === "undefined" ||
    /^dr\.?\s*[-—]?$/i.test(trimmed)
  ) {
    return "";
  }
  if (/^dr\.?\s+/i.test(trimmed)) {
    return trimmed.replace(/^dr\.?\s+/i, "Dr. ");
  }
  return `Dr. ${trimmed}`;
};

/**
 * Robustly extracts the doctor's name from any medical record, appointment,
 * consultation, prescription, or timeline entry.
 *
 * Checks:
 * 1. item.doctor object ({ id, name, full_name, doctor_name, staff: { name } })
 * 2. item.doctor string
 * 3. Direct fields (doctor_name, doctorName, attending_doctor, attendingDoctor)
 * 4. doctor_id / doctorId lookup in staffMembers
 * 5. created_by / createdBy lookup in staffMembers (if staff member is a doctor)
 */
export const extractDoctorName = (
  item: ApiAny,
  staffMembers?: ApiAny[]
): string => {
  if (!item) return "";

  // 1. Direct doctor object on item
  if (item.doctor) {
    if (typeof item.doctor === "object") {
      const docName =
        item.doctor.name ||
        item.doctor.full_name ||
        item.doctor.doctor_name ||
        item.doctor.staff?.name ||
        item.doctor.user?.name;
      if (typeof docName === "string" && docName.trim()) {
        const formatted = formatDoctorDisplayName(docName);
        if (formatted) return formatted;
      }
      // If doctor object has id, try finding in staffMembers
      const docId = item.doctor.id || item.doctor.staff_id;
      if (docId && staffMembers && staffMembers.length > 0) {
        const staff = staffMembers.find((s: ApiAny) => s.id === docId);
        if (staff?.name?.trim()) {
          const formatted = formatDoctorDisplayName(staff.name);
          if (formatted) return formatted;
        }
      }
    } else if (typeof item.doctor === "string" && item.doctor.trim()) {
      const formatted = formatDoctorDisplayName(item.doctor);
      if (formatted) return formatted;
    }
  }

  // 2. Direct string fields on item
  const directName =
    item.doctor_name ||
    item.doctorName ||
    item.attending_doctor ||
    item.attendingDoctor;
  if (typeof directName === "string" && directName.trim()) {
    const formatted = formatDoctorDisplayName(directName);
    if (formatted) return formatted;
  }

  // 3. Lookup via doctor_id / doctorId in staffMembers
  const doctorId = item.doctor_id || item.doctorId;
  if (doctorId && staffMembers && staffMembers.length > 0) {
    const staff = staffMembers.find((s: ApiAny) => s.id === doctorId);
    if (staff?.name?.trim()) {
      const formatted = formatDoctorDisplayName(staff.name);
      if (formatted) return formatted;
    }
  }

  // 4. Lookup via created_by / createdBy in staffMembers
  const createdById = item.created_by || item.createdBy;
  if (createdById && staffMembers && staffMembers.length > 0) {
    const staff = staffMembers.find((s: ApiAny) => s.id === createdById);
    if (staff?.name?.trim()) {
      const isDoctor =
        staff.role === "doctor" ||
        staff.originalRoleName?.toLowerCase().includes("doctor");
      if (isDoctor) {
        const formatted = formatDoctorDisplayName(staff.name);
        if (formatted) return formatted;
      }
    }
  }

  return "";
};
