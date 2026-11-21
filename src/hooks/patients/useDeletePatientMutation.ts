import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface DeletePatientVariables {
  id: string;
}

export function useDeletePatientMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, DeletePatientVariables>({
    getEndpoint: (variables) => `/patient/${variables.id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["patients"] });
      },
    },
  });
}
