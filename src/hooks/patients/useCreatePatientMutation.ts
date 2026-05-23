import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

// ─── API Payload ─────────────────────────────────────────────────────────────

export interface CreatePatientPayload {
  name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;            // MALE | FEMALE | OTHER
  blood_group?: string;       // A_POSITIVE | A_NEGATIVE | B_POSITIVE | B_NEGATIVE | AB_POSITIVE | AB_NEGATIVE | O_POSITIVE | O_NEGATIVE
  address?: string;
  occupation?: string;
  marital_status?: string;    // SINGLE | MARRIED | DIVORCED | WIDOWED

  // Emergency contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;

  // Referral & category
  referred_by?: string;
  patient_category?: string;  // REGULAR | CORPORATE | FAMILY | STAFF | VIP | COMPLIMENTARY

  // Medical history
  past_dental_history?: string;
  medical_histories?: string[];
  allergies?: string[];

  // Previous dentist
  previous_doctor_name?: string;
  clinic_name?: string;
  doctor_phone?: string;
  last_visit_date?: string;
  clinic_address?: string;
  reason_for_treatment?: string;
  previous_treatments?: string[];

  // Multi-step tracking
  current_step?: number;

  // Family / person link (optional)
  primary_patient_id?: string;
}

export interface CreatePatientResponse {
  id: string;
  [key: string]: any;
}

// ─── Field Mapping Helpers ───────────────────────────────────────────────────

const GENDER_MAP: Record<string, string> = {
  male: "MALE",
  female: "FEMALE",
  other: "OTHER",
};

const BLOOD_GROUP_MAP: Record<string, string> = {
  "A+": "A_POSITIVE",
  "A-": "A_NEGATIVE",
  "B+": "B_POSITIVE",
  "B-": "B_NEGATIVE",
  "AB+": "AB_POSITIVE",
  "AB-": "AB_NEGATIVE",
  "O+": "O_POSITIVE",
  "O-": "O_NEGATIVE",
};

const MARITAL_STATUS_MAP: Record<string, string> = {
  single: "SINGLE",
  married: "MARRIED",
  divorced: "DIVORCED",
  widowed: "WIDOWED",
};

const CATEGORY_MAP: Record<string, string> = {
  regular: "REGULAR",
  corporate: "CORPORATE",
  family: "FAMILY",
  staff: "STAFF",
  vip: "VIP",
  complimentary: "COMPLIMENTARY",
};

/**
 * Converts the flat formData object (from usePatientForm) into the
 * shape expected by POST /patient/create.
 */
export function mapFormDataToCreatePayload(
  formData: any,
  options?: { primaryPatientId?: string }
): CreatePatientPayload {
  // Medical histories: stored as newline-separated string in the form
  const medicalHistories = formData.medicalHistory
    ? formData.medicalHistory
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean)
    : [];

  // Allergies: stored as newline-separated string in the form
  const allergies = formData.allergies
    ? formData.allergies
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean)
    : [];

  const payload: CreatePatientPayload = {
    name: formData.name,
    phone: formData.phone,
  };

  if (formData.email) payload.email = formData.email;
  if (formData.dateOfBirth) payload.date_of_birth = formData.dateOfBirth;
  if (formData.gender) payload.gender = GENDER_MAP[formData.gender] ?? formData.gender.toUpperCase();
  if (formData.bloodGroup) payload.blood_group = BLOOD_GROUP_MAP[formData.bloodGroup] ?? formData.bloodGroup;
  if (formData.address) payload.address = formData.address;
  if (formData.occupation) payload.occupation = formData.occupation;
  if (formData.maritalStatus) payload.marital_status = MARITAL_STATUS_MAP[formData.maritalStatus] ?? formData.maritalStatus.toUpperCase();

  // Emergency contact
  if (formData.emergencyName) payload.emergency_contact_name = formData.emergencyName;
  if (formData.emergencyContact) payload.emergency_contact_phone = formData.emergencyContact;
  const emergencyRelation = formData.emergencyRelation === "Other"
    ? formData.customEmergencyRelation
    : formData.emergencyRelation;
  if (emergencyRelation) payload.emergency_contact_relation = emergencyRelation;

  // Referral & category
  if (formData.referredBy) payload.referred_by = formData.referredBy;
  const category = formData.category || "regular";
  payload.patient_category = CATEGORY_MAP[category] ?? category.toUpperCase();

  // Medical history
  if (formData.pastDentalHistory) payload.past_dental_history = formData.pastDentalHistory;
  if (medicalHistories.length) payload.medical_histories = medicalHistories;
  if (allergies.length) payload.allergies = allergies;

  // Previous dentist / clinic
  if (formData.previousDoctorName) payload.previous_doctor_name = formData.previousDoctorName;
  if (formData.previousClinicName) payload.clinic_name = formData.previousClinicName;
  if (formData.previousDoctorPhone) payload.doctor_phone = formData.previousDoctorPhone;
  if (formData.previousLastVisitDate) payload.last_visit_date = formData.previousLastVisitDate;
  if (formData.previousClinicAddress) payload.clinic_address = formData.previousClinicAddress;
  if (formData.previousReason) payload.reason_for_treatment = formData.previousReason;
  if (formData.previousTreatments?.length) payload.previous_treatments = formData.previousTreatments;

  // Step tracking
  payload.current_step = 4;

  // Family link
  if (options?.primaryPatientId) {
    payload.primary_patient_id = options.primaryPatientId;
  }

  return payload;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCreatePatientMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<CreatePatientResponse, CreatePatientPayload>({
    endpoint: "/patient/create",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["patients"] });
      },
    },
  });
}
