import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface RetryNotificationVariables {
  id: string;
}

export function useRetryNotificationMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<ApiAny, RetryNotificationVariables>({
    getEndpoint: (variables) => `/notifications/${variables.id}/retry`,
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      },
    },
  });
}
