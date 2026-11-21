import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CompleteConsultationVariables {
  id: string;
}

export function useCompleteConsultationMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, CompleteConsultationVariables>({
    getEndpoint: (variables) => `/consultations/${variables.id}/complete`,
    method: "patch",
    options: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["consultations"] });
        queryClient.invalidateQueries({ queryKey: ["consultation", variables.id] });
      },
    },
  });
}
