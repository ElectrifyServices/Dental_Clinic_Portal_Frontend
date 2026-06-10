export interface UiConsultation {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  appointmentId?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  observations?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  treatmentCost?: number;
  followUpRequired?: boolean;
  consultationNotes?: string;
  toothFindings?: any[];
  treatments?: any[];
  prescriptions?: any[];
  createdAt: string;
  updatedAt: string;
  appointmentTime?: string;
  patientConcern?: string;
  treatmentType?: string;
}

export interface ApiConsultation {
  id: string;
  patient_id: string;
  patient_name?: string;
  patient_phone?: string;
  doctor_id: string;
  doctor_name?: string;
  appointment_id?: string;
  status: string;
  observations_desc?: string;
  diagnosis_desc?: string;
  treatment_plan_description?: string;
  total_estimated_cost?: number;
  is_follow_up?: boolean;
  additional_notes?: string;
  tooth_findings?: any[];
  treatments?: any[];
  prescriptions?: any[];
  created_at: string;
  updated_at: string;
  patient?: {
    id?: string;
    name?: string;
    phone?: string;
  };
  doctor?: {
    id?: string;
    name?: string;
  };
  treatment_plans?: any[];
}

export function toUiConsultation(apiConsultation: ApiConsultation): UiConsultation {
  if (!apiConsultation) return null;
  
  return {
    id: apiConsultation.id,
    patientId: apiConsultation.patient_id,
    patientName: apiConsultation.patient?.name || apiConsultation.patient_name || '',
    patientPhone: apiConsultation.patient?.phone || apiConsultation.patient_phone || '',
    doctorId: apiConsultation.doctor_id,
    doctorName: apiConsultation.doctor?.name || apiConsultation.doctor_name || '',
    appointmentId: apiConsultation.appointment_id,
    status: apiConsultation.status as UiConsultation['status'],
    observations: apiConsultation.observations_desc,
    diagnosis: apiConsultation.diagnosis_desc,
    treatmentPlan: apiConsultation.treatment_plan_description,
    treatmentCost: apiConsultation.total_estimated_cost,
    followUpRequired: apiConsultation.is_follow_up,
    consultationNotes: apiConsultation.additional_notes,
    toothFindings: apiConsultation.tooth_findings,
    treatments: apiConsultation.treatment_plans || apiConsultation.treatments,
    prescriptions: apiConsultation.prescriptions,
    createdAt: apiConsultation.created_at,
    updatedAt: apiConsultation.updated_at,
  };
}

export function toApiCreateConsultation(uiConsultation: Partial<UiConsultation> & { appointment_info?: any }): any {
  return {
    patient_id: uiConsultation.patientId,
    doctor_id: uiConsultation.doctorId || undefined,
    appointment_id: uiConsultation.appointmentId || undefined,
    observations_desc: uiConsultation.observations,
    diagnosis_desc: uiConsultation.diagnosis,
    treatment_plan_description: uiConsultation.treatmentPlan,
    total_estimated_cost: uiConsultation.treatmentCost,
    is_follow_up: uiConsultation.followUpRequired,
    additional_notes: uiConsultation.consultationNotes,
    status: uiConsultation.status || 'in_progress',
    tooth_findings: uiConsultation.toothFindings || [],
    treatment_plans: uiConsultation.treatments || [],
    prescriptions: uiConsultation.prescriptions || [],
    appointment_info: uiConsultation.appointment_info || undefined,
  };
}

export function toApiUpdateConsultation(uiConsultation: Partial<UiConsultation> & { appointment_info?: any }): any {
  return {
    id: uiConsultation.id,
    patient_id: uiConsultation.patientId,
    doctor_id: uiConsultation.doctorId || undefined,
    appointment_id: uiConsultation.appointmentId || undefined,
    observations_desc: uiConsultation.observations,
    diagnosis_desc: uiConsultation.diagnosis,
    treatment_plan_description: uiConsultation.treatmentPlan,
    total_estimated_cost: uiConsultation.treatmentCost,
    is_follow_up: uiConsultation.followUpRequired,
    additional_notes: uiConsultation.consultationNotes,
    status: uiConsultation.status,
    tooth_findings: uiConsultation.toothFindings,
    treatment_plans: uiConsultation.treatments,
    prescriptions: uiConsultation.prescriptions,
    appointment_info: uiConsultation.appointment_info || undefined,
  };
}
