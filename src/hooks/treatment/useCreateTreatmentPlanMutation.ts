import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CreateTreatmentPrescriptionVariables {
  medicine_name: string;
  dosage: string;
  timing: string;
  frequency: string;
  duration: number;
  duration_type: "DAYS" | "WEEKS" | "MONTHS";
  qty: number;
  instructions?: string;
}

export interface CreateTreatmentSessionVariables {
  visit_date?: string;           // "YYYY-MM-DD"
  start_time?: string;           // "09:00 AM"
  duration_min?: number;         // default 45
  session_fee?: number;
  clinical_objectives?: string;
}

export interface CreateTreatmentPlanVariables {
  patient_id: string;
  doctor_id: string;
  consultation_id?: string;
  tooth_number?: number;
  procedure: string;
  treatment_date: string;       // "YYYY-MM-DD"
  est_cost?: number;
  status?: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  clinical_notes?: string;
  prescriptions?: CreateTreatmentPrescriptionVariables[];
  sessions?: CreateTreatmentSessionVariables[];  // Added sessions
}

export interface TreatmentPlanResponse {
  id: string;
  patient_id: string;
  doctor_id: string;
  consultation_id?: string;
  tooth_number?: number;
  procedure: string;
  treatment_date: string;
  est_cost: string;
  status: string;
  next_appointment?: string;
  clinical_notes?: string;
  created_at: string;
  updated_at: string;
  patient: { id: string; name: string; phone: string };
  doctor: { id: string; staff: { name: string } };
  sessions: any[];
  prescriptions: any[];
}

export function useCreateTreatmentPlanMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<TreatmentPlanResponse, CreateTreatmentPlanVariables>({
    getEndpoint: () => "/treatment",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["treatmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlanStats"] });
      },
    },
  });
}