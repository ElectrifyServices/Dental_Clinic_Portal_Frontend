import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface DeleteStaffVariables {
  id: string;
}

export function useDeleteStaffMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, DeleteStaffVariables>({
    getEndpoint: (variables) => `/staff/${variables.id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["staff"] });
      },
    },
  });
}
