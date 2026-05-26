import { useApiQuery } from "../useApiQuery";

const REVERSE_BLOOD_GROUP_MAP: Record<string, string> = {
  "A_POSITIVE": "A+",
  "A_NEGATIVE": "A-",
  "B_POSITIVE": "B+",
  "B_NEGATIVE": "B-",
  "AB_POSITIVE": "AB+",
  "AB_NEGATIVE": "AB-",
  "O_POSITIVE": "O+",
  "O_NEGATIVE": "O-",
};

export function normalizePatient(payload: any) {
  if (!payload) return null;
  
  // Unwrap the patient object if the backend wraps it in "patient", "data", etc.
  const p = payload.patient || payload.data || payload;

  return {
    ...p,
    id: p.id,
    name: p.name || p.full_name || '',
    email: p.email || '',
    phone: p.phone || p.mobile || '',
    status: p.status || (p.is_active ? 'active' : 'inactive'),
    isActive: p.status === 'ACTIVE' || p.is_active === true,
    avatar: p.profile_picture || p.avatar || '',
    age: p.age || p.dob || '',
    gender: p.gender ? p.gender.toLowerCase() : '',
    
    // Mapped fields for usePatientForm
    dateOfBirth: p.date_of_birth || p.dateOfBirth || '',
    bloodGroup: REVERSE_BLOOD_GROUP_MAP[p.blood_group] || p.blood_group || p.bloodGroup || '',
    maritalStatus: p.marital_status ? p.marital_status.toLowerCase() : '',
    address: p.address || '',
    occupation: p.occupation || '',
    
    // Emergency Contact
    emergencyName: p.emergency_contact_name || p.emergencyName || '',
    emergencyContact: p.emergency_contact_phone || p.emergencyContact || '',
    emergencyRelation: p.emergency_contact_relation || p.emergencyRelation || '',
    
    // Referral & Category
    referredBy: p.referred_by || p.referredBy || '',
    category: p.patient_category ? p.patient_category.toLowerCase() : 'regular',
    isFOC: p.is_foc || p.isFOC || false,
    defaultDiscount: p.discount_percentage !== undefined ? p.discount_percentage : (p.defaultDiscount || 0),
    
    // Medical History
    medicalHistory: (p.medicalHistories || p.medical_histories || p.medicalHistory || []).map((m: any) => typeof m === 'object' ? (m.history_id || m.medical_history_id || m.id) : m),
    allergies: (p.allergies || []).map((a: any) => typeof a === 'object' ? (a.allergy_id || a.id) : a),
    medicalHistoryNames: (p.medicalHistories || p.medical_histories || p.medicalHistory || []).map((m: any) => typeof m === 'object' ? (m.history?.name || m.medical_history?.name || m.name || m.history_id || m.medical_history_id || m.id) : m),
    allergyNames: (p.allergies || []).map((a: any) => typeof a === 'object' ? (a.allergy?.allergy_name || a.allergy?.name || a.allergy_name || a.name || a.allergy_id || a.id) : a),
    pastDentalHistory: p.past_dental_history || p.pastDentalHistory || '',
    
    // Previous Dentist
    previousDoctorName: p.previous_doctor_name || p.previousDoctorName || '',
    previousClinicName: p.clinic_name || p.previousClinicName || '',
  };
}

export function usePatientDetailQuery(id: string, enabled = true) {
  const query = useApiQuery<any>({
    queryKey: ["patients", "detail", id],
    endpoint: `/patient/${id}`,
    method: "get",
    options: {
      enabled: !!id && enabled,
    },
  });

  return {
    ...query,
    data: query.data ? normalizePatient(query.data) : null,
  };
}
