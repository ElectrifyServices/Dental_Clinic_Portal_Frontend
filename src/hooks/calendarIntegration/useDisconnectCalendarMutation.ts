import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface DisconnectCalendarVariables {
  id: string;
}

export function useDisconnectCalendarMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, DisconnectCalendarVariables>({
    getEndpoint: (variables) => `/calendarIntegration/${variables.id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["calendarIntegrations"] });
      },
    },
  });
}
