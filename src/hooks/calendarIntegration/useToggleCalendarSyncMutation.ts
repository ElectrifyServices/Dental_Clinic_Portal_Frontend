import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import type { CalendarIntegration } from "@/types/calendarIntegration.types";

export interface ToggleCalendarSyncVariables {
  id: string;
  sync_enabled: boolean;
}

export function useToggleCalendarSyncMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<CalendarIntegration, ToggleCalendarSyncVariables>({
    getEndpoint: (variables) => `/calendarIntegration/${variables.id}/toggle`,
    method: "patch",
    transformRequest: (variables) => ({ sync_enabled: variables.sync_enabled }),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["calendarIntegrations"] });
      },
    },
  });
}
