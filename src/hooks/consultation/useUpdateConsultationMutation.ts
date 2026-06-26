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
    transformRequest: (variables: any) => {
      if (variables.attachments && variables.attachments.length > 0) {
        const formData = new FormData();
        Object.keys(variables).forEach((key) => {
          if (key === "attachments") {
            variables.attachments.forEach((file: File) => {
              formData.append("attachments", file);
            });
          } else if (variables[key] !== undefined && variables[key] !== null) {
            if (typeof variables[key] === "object") {
              formData.append(key, JSON.stringify(variables[key]));
            } else {
              formData.append(key, String(variables[key]));
            }
          }
        });
        return formData;
      }
      return variables;
    },
    headers: (variables: any) => {
      if (variables.attachments && variables.attachments.length > 0) {
        return { "Content-Type": "multipart/form-data" };
      }
      return undefined;
    },
    options: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["consultations"] });
        queryClient.invalidateQueries({ queryKey: ["consultation", variables.id] });
      },
    },
  });
}
