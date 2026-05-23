import { useApiMutation } from "../useApiMutation";

export interface DeleteCorporatePlanVariables {
  id: string;
}

export function useDeleteCorporatePlanMutation() {
  return useApiMutation<any, DeleteCorporatePlanVariables>({
    getEndpoint: (variables) => `/corporate/plan/${variables.id}`,
    method: "delete",
    transformRequest: () => undefined,
  });
}
