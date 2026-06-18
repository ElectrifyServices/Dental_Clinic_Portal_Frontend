import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface DeleteCorporatePlanVariables {
  id: string;
}

export function useDeleteCorporatePlanMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<any, DeleteCorporatePlanVariables>({
    getEndpoint: (variables) => `/membershipPlan/${variables.id}`,
    method: "delete",
    transformRequest: () => undefined,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["membershipPlans"] });
        queryClient.invalidateQueries({ queryKey: ["membershipStats"] });
      },
    },
  });
}
