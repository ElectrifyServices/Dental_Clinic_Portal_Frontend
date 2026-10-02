import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdatePatientResponse {
  id: string;
  [key: string]: ApiAny;
}

export function useUpdatePatientMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<UpdatePatientResponse, { id: string; formData: FormData }>({
    getEndpoint: (variables) => `/patient/${variables.id}`,
    method: "put",
    transformRequest: (variables) => variables.formData,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["patients"] });
      },
    },
  });
}
