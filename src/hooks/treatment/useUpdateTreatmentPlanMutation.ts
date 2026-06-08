import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { CreateTreatmentPrescriptionVariables, TreatmentPlanResponse } from "./useCreateTreatmentPlanMutation";

export interface UpdateTreatmentPrescriptionVariables extends Partial<CreateTreatmentPrescriptionVariables> {
  id?: string;
}

export interface UpdateTreatmentSessionVariables {
  id?: string;
  visit_date?: string;
  start_time?: string;
  duration_min?: number;
  session_fee?: number;
  clinical_objectives?: string;
  work_done?: string;
  session_findings?: string;
  next_session_plan?: string;
  status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

export interface UpdateTreatmentPlanVariables {
  id: string;
  tooth_number?: number;
  procedure?: string;
  treatment_date?: string;
  est_cost?: number;
  status?: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  clinical_notes?: string;
  doctor_id?: string;
  prescriptions?: UpdateTreatmentPrescriptionVariables[];
  sessions?: UpdateTreatmentSessionVariables[];  // Added sessions support
}

export function useUpdateTreatmentPlanMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<TreatmentPlanResponse, UpdateTreatmentPlanVariables>({
    getEndpoint: (variables) => `/treatment/${variables.id}`,
    method: "patch",
    transformRequest: ({ id: _id, ...rest }) => rest,
    options: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["treatmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlan", variables.id] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlanStats"] });
        // Also invalidate sessions queries
        queryClient.invalidateQueries({ queryKey: ["treatmentSessions", variables.id] });
      },
    },
  });
}