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
  corporate: "MEMBERSHIP",
  membership: "MEMBERSHIP",
  family: "FAMILY",
  staff: "CLINIC_STAFF",
  vip: "VIP",
  complimentary: "COMPLIMENTARY",
};

/**
 * Converts the flat formData object (from usePatientForm) into a FormData 
 * object expected by POST /patient/create.
 */
export function mapFormDataToCreatePayload(
  formData: any,
  options?: { primaryPatientId?: string }
): FormData {
  const payload = new FormData();

  // Basic Details
  if (formData.name) payload.append('name', formData.name);
  if (formData.phone) payload.append('phone', formData.phone);
  if (formData.email) payload.append('email', formData.email);
  if (formData.dateOfBirth) payload.append('date_of_birth', formData.dateOfBirth);

  if (formData.gender) payload.append('gender', GENDER_MAP[formData.gender] ?? formData.gender.toUpperCase());
  if (formData.bloodGroup) payload.append('blood_group', BLOOD_GROUP_MAP[formData.bloodGroup] ?? formData.bloodGroup);
  if (formData.address) payload.append('address', formData.address);
  if (formData.occupation) payload.append('occupation', formData.occupation);
  if (formData.maritalStatus) payload.append('marital_status', MARITAL_STATUS_MAP[formData.maritalStatus] ?? formData.maritalStatus.toUpperCase());

  // Emergency contact
  if (formData.emergencyName) payload.append('emergency_contact_name', formData.emergencyName);
  if (formData.emergencyContact) payload.append('emergency_contact_phone', formData.emergencyContact);
  const emergencyRelation = formData.emergencyRelation === "Other"
    ? formData.customEmergencyRelation
    : formData.emergencyRelation;
  if (emergencyRelation) payload.append('emergency_contact_relation', emergencyRelation);

  // Relation Type — values are already backend enum values (FATHER, MOTHER, etc.)
  // For OTHER, use the custom text typed by user
  const relationType = formData.relation === "OTHER"
    ? formData.customRelation?.trim()
    : formData.relation;
  if (relationType) payload.append('relation_type', relationType);

  // Referral & category
  if (formData.referredBy) payload.append('referred_by', formData.referredBy);
  const category = formData.category || "regular";
  payload.append('patient_category', CATEGORY_MAP[category] ?? category.toUpperCase());

  // Arrays (Medical History & Allergies)
  const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const medicalHistories = formData.medicalHistory
    ? formData.medicalHistory.split("\n").map((s: string) => s.trim()).filter(Boolean)
    : [];
  medicalHistories.filter(isUUID).forEach((id: string) => payload.append('medical_history_ids', id));

  const allergies = formData.allergies
    ? formData.allergies.split("\n").map((s: string) => s.trim()).filter(Boolean)
    : [];
  allergies.filter(isUUID).forEach((id: string) => payload.append('allergy_ids', id));

  // Past Dental History
  if (formData.pastDentalHistory) payload.append('past_dental_history', formData.pastDentalHistory);

  // Previous dentist / clinic
  if (formData.previousDoctorName) payload.append('previous_doctor_name', formData.previousDoctorName);
  if (formData.previousClinicName) payload.append('clinic_name', formData.previousClinicName);
  if (formData.previousDoctorPhone) payload.append('doctor_phone', formData.previousDoctorPhone);
  if (formData.previousLastVisitDate) payload.append('last_visit_date', formData.previousLastVisitDate);
  if (formData.previousClinicAddress) payload.append('clinic_address', formData.previousClinicAddress);
  if (formData.previousReason) payload.append('reason_for_treatment', formData.previousReason);

  if (formData.previousTreatments?.length) {
    formData.previousTreatments.forEach((pt: string) => payload.append('previous_treatments', pt));
  }

  // Membership / Corporate Plan
  if (formData.selectedMembershipPlanId) {
    payload.append('plan_id', formData.selectedMembershipPlanId);
  } else if ((formData.category === "corporate" || formData.category === "membership") && formData.corporatePlanId) {
    payload.append('plan_id', formData.corporatePlanId);
  }

  if (formData.corporateMemberId) {
    payload.append('member_id', formData.corporateMemberId);
  }

  // Family link
  if (options?.primaryPatientId) {
    payload.append('primary_patient_id', options.primaryPatientId);
  }

  if (formData.rawAvatarFile) {
    payload.append('profile_picture', formData.rawAvatarFile);
  }
  if (formData.rawConsentFormFile) {
    payload.append('consent_form_image', formData.rawConsentFormFile);
  }
  if (formData.isFOC) {
    payload.append('freeOfCost', 'true');
    payload.append('discount_percentage', '100');
  } else if (formData.defaultDiscount !== undefined) {
    payload.append('discount_percentage', String(formData.defaultDiscount));
  }

  // Convert base64 signature to File
  const signatureData = formData.patientSignature || formData.guardianSignature;
  if (signatureData && signatureData.startsWith('data:image')) {
    try {
      const arr = signatureData.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (mimeMatch) {
        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const file = new File([u8arr], "signature.png", { type: mime });
        payload.append('consent_signature_image', file);
      }
    } catch (e) {
    }
  }

  if (formData.rawDentalFiles?.length) {
    formData.rawDentalFiles.forEach((file: File) => {
      payload.append('medical_images', file);
    });
  }

  return payload;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface CreatePatientResponse {
  id: string;
  [key: string]: any;
}

export function useCreatePatientMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<CreatePatientResponse, FormData>({
    endpoint: "/patient",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["patients"] });
      },
    },
  });
}
