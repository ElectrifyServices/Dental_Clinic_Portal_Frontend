export interface ConsultationToothFinding {
  tooth_number: number;
  condition: string;
}

export interface ConsultationTreatment {
  treatment_id?: string;
  tooth_number?: number;
  procedure: string;
  sessions?: number;
  est_cost?: number;
  is_active?: boolean;
}

export interface ConsultationPrescription {
  prescription_id?: string;
  medicine_name: string;
  dosage: string;
  timing: string;
  frequency: string;
  duration: number;
  duration_type: string;
  qty: number;
  instructions?: string;
}

export interface CreateConsultationVariables {
  patient_id: string;
  appointment_id?: string;
  observations_desc?: string;
  diagnosis_desc?: string;
  treatment_plan_description?: string;
  total_estimated_cost?: number;
  is_follow_up?: boolean;
  additional_notes?: string;
  status?: string;
  tooth_findings?: ConsultationToothFinding[];
  treatments?: ConsultationTreatment[];
  prescriptions?: ConsultationPrescription[];
}

export interface UpdateConsultationVariables extends CreateConsultationVariables {
  id: string;
}

export interface ConsultationResponse {
  id: string;
  consultation_id?: string;
  patient_id?: string;
  appointment_id?: string;
  observations_desc?: string;
  diagnosis_desc?: string;
  treatment_plan_description?: string;
  total_estimated_cost?: number;
  is_follow_up?: boolean;
  additional_notes?: string;
  status?: string;
  tooth_findings?: ConsultationToothFinding[];
  treatments?: ConsultationTreatment[];
  prescriptions?: ConsultationPrescription[];
  created_at?: string;
  updated_at?: string;
  patient?: {
    id: string;
    name?: string;
    phone?: string;
  };
  doctor?: {
    id?: string;
    name?: string;
  };
}
