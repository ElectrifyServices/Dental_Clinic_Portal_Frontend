import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateCorporatePlanStatusVariables {
  id: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export function useUpdateCorporatePlanStatusMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<ApiAny, UpdateCorporatePlanStatusVariables>({
    getEndpoint: (variables) => `/membershipPlan/${variables.id}`,
    method: "patch",
    transformRequest: (variables) => ({ status: variables.status }),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["membershipPlans"] });
        queryClient.invalidateQueries({ queryKey: ["membershipStats"] });
      },
    },
  });
}
