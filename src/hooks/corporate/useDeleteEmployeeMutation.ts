import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface DeleteEmployeeVariables {
  id: string;
}

export function useDeleteEmployeeMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<any, DeleteEmployeeVariables>({
    getEndpoint: (variables) => `/employee/${variables.id}`,
    method: "delete",
    transformRequest: () => undefined,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["employees"] });
      },
    },
  });
}
