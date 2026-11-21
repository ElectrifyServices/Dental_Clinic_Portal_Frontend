import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateLabWorkStatusVariables {
  id: string;
  status: "ordered" | "received" | "paid" | "cancelled";
}

export function useUpdateLabWorkStatusMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, UpdateLabWorkStatusVariables>({
    getEndpoint: (variables) => `/labWork/status/${variables.id}`,
    method: "patch",
    transformRequest: (variables) => ({ status: variables.status.toUpperCase() }),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["labWorks"] });
      },
    },
  });
}
