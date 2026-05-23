import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateCorporatePlanStatusVariables {
  id: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export function useUpdateCorporatePlanStatusMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<any, UpdateCorporatePlanStatusVariables>({
    getEndpoint: (variables) => `/corporate/plan/status/${variables.id}`,
    method: "patch",
    transformRequest: (variables) => ({ status: variables.status }),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["corporatePlans"] });
      },
    },
  });
}
