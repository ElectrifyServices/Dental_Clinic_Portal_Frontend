import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export function useRestoreAppointmentStatusMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, { id: string, status: string }>({
    getEndpoint: (variables) => `/appointment/status/${variables.id}`,
    method: "patch",
    transformRequest: (variables) => ({ status: variables.status }),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
      },
    },
  });
}
