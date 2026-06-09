import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateEmployeeStatusVariables {
  id: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export function useUpdateEmployeeStatusMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<any, UpdateEmployeeStatusVariables>({
    getEndpoint: (variables) => `/employee/status/${variables.id}`,
    method: "patch",
    transformRequest: (variables) => ({ status: variables.status }),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["employees"] });
      },
    },
  });
}
