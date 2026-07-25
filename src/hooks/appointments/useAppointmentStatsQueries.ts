import { useApiQuery } from "../useApiQuery";

export interface AppointmentStatsResponse {
  count?: number;
  total?: number;
  [key: string]: any;
}

export function useAppointmentTotalVolumeQuery() {
  return useApiQuery<AppointmentStatsResponse>({
    queryKey: ["appointments", "stats", "total-volume", "2026-07-01", "2026-07-31"],
    endpoint: "/appointments/stats/total-volume?startDate=2026-07-01&endDate=2026-07-31",
    method: "get",
  });
}

export function useAppointmentUpcomingQuery() {
  return useApiQuery<AppointmentStatsResponse>({
    queryKey: ["appointments", "stats", "upcoming", "2026-07-01", "2026-07-31"],
    endpoint: "/appointments/stats/upcoming?startDate=2026-07-01&endDate=2026-07-31",
    method: "get",
  });
}

export function useAppointmentCompletedQuery() {
  return useApiQuery<AppointmentStatsResponse>({
    queryKey: ["appointments", "stats", "completed", "2026-07-01", "2026-07-31"],
    endpoint: "/appointments/stats/completed?startDate=2026-07-01&endDate=2026-07-31",
    method: "get",
  });
}

export function useAppointmentCancelledQuery() {
  return useApiQuery<AppointmentStatsResponse>({
    queryKey: ["appointments", "stats", "cancelled", "2026-07-01", "2026-07-31"],
    endpoint: "/appointments/stats/cancelled?startDate=2026-07-01&endDate=2026-07-31",
    method: "get",
  });
}
