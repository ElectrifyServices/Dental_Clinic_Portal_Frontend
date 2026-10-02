import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdatePatientStatusVariables {
  id: string;
  status: "ACTIVE" | "INACTIVE";
}

export function useUpdatePatientStatusMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<ApiAny, UpdatePatientStatusVariables>({
    getEndpoint: (variables) => `/patient/status/${variables.id}`,
    method: "patch",
    transformRequest: (variables) => ({ is_active: variables.status === "ACTIVE" }),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["patients"] });
      },
    },
  });
}
