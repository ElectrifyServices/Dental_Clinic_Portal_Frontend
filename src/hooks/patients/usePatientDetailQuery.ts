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
  
  // Unwrap the patient object if the backend wraps it
  const p = payload?.responseObject?.data || payload?.data || payload?.patient || payload;

  const prevDental = p.previous_dental || {};

  // Medical History
  const rawMedHistory = p.medical_histories || p.medical_history || p.medicalHistories || [];
  const rawAllergies = p.allergies || [];

  return {
    ...p,
    id: p.id,
    name: p.name || p.full_name || '',
    email: p.email || '',
    phone: p.phone || p.mobile || '',
    status: p.status || (p.is_active ? 'active' : 'inactive'),
    isActive: p.status === 'ACTIVE' || p.is_active === true,
    avatar: p.profile_picture_url || p.profile_picture || p.avatar || '',
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
    isFOC: p.freeOfCost || p.is_foc || p.isFOC || false,
    defaultDiscount: p.discount_percentage !== undefined ? p.discount_percentage : (p.defaultDiscount || 0),
    
    // Medical History
    medicalHistory: rawMedHistory.map((m: any) => typeof m === 'object' ? (m.history_id || m.medical_history_id || m.id) : m),
    allergies: rawAllergies.map((a: any) => typeof a === 'object' ? (a.allergy_id || a.id) : a),
    medicalHistoryNames: rawMedHistory.map((m: any) => typeof m === 'object' ? (m.history?.name || m.name || m.condition || m.history_name || '') : m).filter(Boolean),
    allergyNames: rawAllergies.map((a: any) => typeof a === 'object' ? (a.allergy?.name || a.name || a.allergen || '') : a).filter(Boolean),
    pastDentalHistory: p.past_dental_history || p.pastDentalHistory || '',
    
    // Previous Dentist (nested in previous_dental)
    previousDoctorName: prevDental.previous_doctor_name || p.previous_doctor_name || '',
    previousClinicName: prevDental.clinic_name || p.clinic_name || '',
    previousDoctorPhone: prevDental.doctor_phone || p.doctor_phone || '',
    previousLastVisitDate: prevDental.last_visit_date || p.last_visit_date || '',
    previousClinicAddress: prevDental.clinic_address || p.clinic_address || '',
    previousReason: prevDental.reason_for_treatment || p.reason_for_treatment || '',
    previousTreatments: prevDental.previous_treatments || p.previous_treatments || [],
    
    // Consents & Images
    consentFormUrl: p.consent_form_url || p.consentFormUrl || '',
    patientSignature: p.consent_signature_url || p.patientSignature || '',
    dentalFiles: (p.images || []).map((img: any) => ({
      name: img.file_name,
      url: img.image_url,
      type: img.mime_type
    })),

    // Relation for dependents
    relation: p.relation_type || p.relation || '',
    primaryPatientId: p.primary_patient_id || p.primaryPatientId || null,
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
