import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ConsultationResponse,
  CreateConsultationVariables,
} from "./consultationTypes";

export function useCreateConsultationMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<ConsultationResponse, CreateConsultationVariables>({
    endpoint: "/consultations",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["consultations"] });
      },
    },
  });
}
