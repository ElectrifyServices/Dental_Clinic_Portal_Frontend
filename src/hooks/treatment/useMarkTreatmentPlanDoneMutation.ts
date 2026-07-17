import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { TreatmentPlanResponse } from "./useCreateTreatmentPlanMutation";
import { AuthStorage } from "../../auth/authStorage";

const getAuthHeaders = () => {
  const user = AuthStorage.getUser();
  return user?.id ? { "x-staff-id": user.id } : {};
};

export interface MarkDoneVariables {
  id: string;
}

export function useMarkTreatmentPlanDoneMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<TreatmentPlanResponse, MarkDoneVariables>({
    getEndpoint: (variables) => `/treatment/${variables.id}/mark-done`,
    method: "patch",
    headers: getAuthHeaders,
    transformRequest: () => ({}),  // no body needed
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
