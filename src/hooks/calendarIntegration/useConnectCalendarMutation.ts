import { useApiMutation } from "../useApiMutation";
import type { CalendarProvider } from "@/types/calendarIntegration.types";

export interface ConnectCalendarResponse {
  authUrl: string;
}

interface ConnectCalendarRawResponse {
  authUrl?: string;
  data?: { authUrl?: string };
}

export function useConnectCalendarMutation() {
  const mutation = useApiMutation<ConnectCalendarRawResponse, Lowercase<CalendarProvider>>({
    getEndpoint: (provider) => `/calendarIntegration/connect/${provider}`,
    method: "get",
    transformRequest: () => undefined,
  });

  return {
    ...mutation,
    mutateAsync: async (provider: Lowercase<CalendarProvider>): Promise<ConnectCalendarResponse> => {
      const raw = await mutation.mutateAsync(provider);
      const authUrl = raw?.authUrl ?? raw?.data?.authUrl;
      if (!authUrl) {
        throw new Error("No authorization URL returned");
      }
      return { authUrl };
    },
  };
}
