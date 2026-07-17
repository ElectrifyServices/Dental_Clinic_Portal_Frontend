import { useMutation } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import { parseApiResponse, type ApiResponse } from "@/services/parseApiResponse";
import type { CalendarProvider } from "@/types/calendarIntegration.types";

export interface ConnectCalendarResponse {
  authUrl: string;
}

interface ConnectCalendarRawResponse {
  authUrl?: string;
  data?: { authUrl?: string };
}

export function useConnectCalendarMutation() {
  return useMutation<ConnectCalendarResponse, any, Lowercase<CalendarProvider>>({
    mutationFn: async (provider) => {
      const res = await apiClient.get<ApiResponse<ConnectCalendarRawResponse>>(
        `/calendarIntegration/connect/${provider}`
      );
      const parsed = parseApiResponse(res.data);

      if (parsed.status && (parsed.status.statusCode < 200 || parsed.status.statusCode >= 300)) {
        throw new Error(parsed.status.statusDesc || "Failed to start calendar connection");
      }
      const authUrl = parsed.data?.authUrl ?? parsed.data?.data?.authUrl;
      if (!authUrl) {
        throw new Error("No authorization URL returned");
      }
      return { authUrl };
    },
  });
}
