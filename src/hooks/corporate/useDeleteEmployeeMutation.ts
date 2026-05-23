import { useApiMutation } from "../useApiMutation";

export interface DeleteEmployeeVariables {
  id: string;
}

export function useDeleteEmployeeMutation() {
  return useApiMutation<any, DeleteEmployeeVariables>({
    getEndpoint: (variables) => `/employee/${variables.id}`,
    method: "delete",
    transformRequest: () => undefined,
  });
}
