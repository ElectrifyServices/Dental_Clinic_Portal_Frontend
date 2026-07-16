import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { TreatmentPlanResponse } from "./useCreateTreatmentPlanMutation";

export interface UpdateTreatmentPlanStatusVariables {
  id: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

export function useUpdateTreatmentPlanStatusMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<TreatmentPlanResponse, UpdateTreatmentPlanStatusVariables>({
    getEndpoint: (variables) => `/treatment/${variables.id}/status`,
    method: "patch",
    transformRequest: ({ id: _id, ...rest }) => rest,
    options: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["treatmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["patientTreatmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlan", variables.id] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlanStats"] });
      },
    },
  });
}
