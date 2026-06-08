export interface Prescription {
  id: string;
  medicine: string;
  dosage: string;
  timing: string;
  frequency: string;
  duration: string;
  qty: string;
  instructions?: string;
}

export interface TreatmentSession {
  id: string;
  sessionNumber: number;
  name: string;
  description: string;
  suggestedDate: string;
  scheduledDate: string;
  startTime?: string;
  duration: number;
  status: string;
  isRequired: boolean;
  isOptional: boolean;
  isFlexible: boolean;
  cost: number;
  isModified: boolean;
  notes: string;
  workDone?: string;
  findings?: string;
  nextPlan?: string;
}

export interface TreatmentFormProps {
  onClose: () => void;
  onSave: (treatment: any) => void;
  treatment?: any;
  patients: any[];
  doctors: any[];
  treatments?: any[];
}

export interface CreateTreatmentSessionDto {
  visit_date?: string;
  start_time?: string;
  duration_min?: number;
  session_fee?: number;
  clinical_objectives?: string;
}