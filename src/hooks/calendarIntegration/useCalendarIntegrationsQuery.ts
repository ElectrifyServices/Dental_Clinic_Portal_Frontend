import { useApiQuery } from "../useApiQuery";
import type { CalendarIntegration } from "@/types/calendarIntegration.types";

interface CalendarIntegrationsRawResponse {
  data?: CalendarIntegration[];
}

function unwrapList(raw: CalendarIntegrationsRawResponse | CalendarIntegration[] | null | undefined): CalendarIntegration[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  return [];
}

export function useCalendarIntegrationsQuery() {
  const query = useApiQuery<CalendarIntegrationsRawResponse | CalendarIntegration[]>({
    queryKey: ["calendarIntegrations"],
    endpoint: "/calendarIntegration",
    method: "get",
  });

  return { ...query, data: unwrapList(query.data) };
}
