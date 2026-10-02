import { useApiQuery } from "../useApiQuery";

export interface AvailabilityOverride {
  id: string;
  staff_id: string;
  date: string;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
}

export interface AvailabilityOverridesResponse {
  data: AvailabilityOverride[];
}

export function useAvailabilityOverridesQuery(doctorId: string | null | undefined, date: string | null | undefined) {
  return useApiQuery<AvailabilityOverridesResponse>({
    queryKey: ["availabilityOverrides", doctorId, date],
    endpoint: `/doctorSchedule/${doctorId}/exceptions`,
    method: "get",
    params: { date },
    options: {
      enabled: Boolean(doctorId && date),
      refetchOnMount: "always",
    },
  });
}
