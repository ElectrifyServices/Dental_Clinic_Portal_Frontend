import { useApiQuery } from "../useApiQuery";

export interface AppointmentStatsResponse {
  count?: number;
  total?: number;
  [key: string]: any;
}

export function useAppointmentTotalVolumeQuery() {
  return useApiQuery<AppointmentStatsResponse>({
    queryKey: ["appointments", "stats", "total-volume"],
    endpoint: "/appointment/stats/total-volume",
    method: "get",
  });
}

export function useAppointmentUpcomingQuery() {
  return useApiQuery<AppointmentStatsResponse>({
    queryKey: ["appointments", "stats", "upcoming"],
    endpoint: "/appointment/stats/upcoming",
    method: "get",
  });
}

export function useAppointmentCompletedQuery() {
  return useApiQuery<AppointmentStatsResponse>({
    queryKey: ["appointments", "stats", "completed"],
    endpoint: "/appointment/stats/completed",
    method: "get",
  });
}

export function useAppointmentCancelledQuery() {
  return useApiQuery<AppointmentStatsResponse>({
    queryKey: ["appointments", "stats", "cancelled"],
    endpoint: "/appointment/stats/cancelled",
    method: "get",
  });
}
