import { useApiMutation } from "../useApiMutation";
import type { CalendarIntegration } from "@/types/calendarIntegration.types";

export interface CalendarCallbackVariables {
  provider: string;
  code: string;
  state: string;
}

export function useCalendarCallbackMutation() {
  return useApiMutation<CalendarIntegration, CalendarCallbackVariables>({
    getEndpoint: (variables) => `/calendarIntegration/callback/${variables.provider}`,
    method: "post",
    transformRequest: (variables) => ({ code: variables.code, state: variables.state }),
  });
}
