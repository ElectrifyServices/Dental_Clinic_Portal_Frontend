import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { TreatmentPlanResponse } from "./useCreateTreatmentPlanMutation";

export interface MarkDoneVariables {
  id: string;
}

export function useMarkTreatmentPlanDoneMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<TreatmentPlanResponse, MarkDoneVariables>({
    getEndpoint: (variables) => `/treatment/${variables.id}/mark-done`,
    method: "patch",
    transformRequest: () => ({}),  // no body needed
    options: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["treatmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlan", variables.id] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlanStats"] });
      },
    },
  });
}
