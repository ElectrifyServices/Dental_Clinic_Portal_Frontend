import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateStaffStatusVariables {
  id: string;
  status: "ACTIVE" | "INACTIVE";
}

export function useUpdateStaffStatusMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, UpdateStaffStatusVariables>({
    getEndpoint: (variables) => `/staff/status/${variables.id}`,
    method: "patch",
    transformRequest: (variables) => ({ status: variables.status }),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["staff"] });
      },
    },
  });
}
