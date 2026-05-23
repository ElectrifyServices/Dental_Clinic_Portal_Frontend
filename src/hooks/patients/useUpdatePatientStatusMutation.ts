import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdatePatientStatusVariables {
  id: string;
  status: "ACTIVE" | "INACTIVE";
}

export function useUpdatePatientStatusMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, UpdatePatientStatusVariables>({
    getEndpoint: (variables) => `/patient/status/${variables.id}`,
    method: "patch",
    transformRequest: (variables) => ({ status: variables.status }),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["patients"] });
      },
    },
  });
}
