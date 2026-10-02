import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateEmployeeStatusVariables {
  id: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export function useUpdateEmployeeStatusMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<ApiAny, UpdateEmployeeStatusVariables>({
    getEndpoint: (variables) => `/member/${variables.id}`,
    method: "patch",
    transformRequest: (variables) => ({ status: variables.status }),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["member"] });
      },
    },
  });
}
