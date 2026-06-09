import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface DeleteConsultationVariables {
  id: string;
}

export function useDeleteConsultationMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, DeleteConsultationVariables>({
    getEndpoint: (variables) => `/consultations/${variables.id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["consultations"] });
      },
    },
  });
}
