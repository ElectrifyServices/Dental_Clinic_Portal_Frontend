import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ConsultationResponse,
  UpdateConsultationVariables,
} from "../../types/consultationTypes";

export function useUpdateConsultationMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<ConsultationResponse, UpdateConsultationVariables>({
    getEndpoint: (variables) => `/consultations/${variables.id}`,
    method: "patch",
    options: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["consultations"] });
        queryClient.invalidateQueries({ queryKey: ["consultation", variables.id] });
      },
    },
  });
}
