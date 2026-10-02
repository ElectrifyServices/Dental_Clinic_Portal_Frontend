import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface DeletePatientVariables {
  id: string;
}

export function useDeletePatientMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<ApiAny, DeletePatientVariables>({
    getEndpoint: (variables) => `/patient/${variables.id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["patients"] });
      },
    },
  });
}
