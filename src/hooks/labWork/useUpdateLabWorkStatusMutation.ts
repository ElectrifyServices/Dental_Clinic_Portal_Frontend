import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateLabWorkStatusVariables {
  id: string;
  status: "ordered" | "received" | "paid";
}

export function useUpdateLabWorkStatusMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, UpdateLabWorkStatusVariables>({
    getEndpoint: (variables) => `/lab-work/${variables.id}/status`,
    method: "patch",
    transformRequest: (variables) => ({ status: variables.status }),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["labWorks"] });
      },
    },
  });
}
