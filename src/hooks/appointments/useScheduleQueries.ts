import { useApiQuery } from "../useApiQuery";

export interface ScheduleCountResponse {
  count?: number;
  total?: number;
  [key: string]: any;
}

export function useScheduleBookedQuery() {
  return useApiQuery<ScheduleCountResponse>({
    queryKey: ["dashboard", "schedule", "booked"],
    endpoint: "/dashboard/schedule/booked",
    method: "get",
  });
}

export function useSchedulePendingQuery() {
  return useApiQuery<ScheduleCountResponse>({
    queryKey: ["dashboard", "schedule", "pending"],
    endpoint: "/dashboard/schedule/pending",
    method: "get",
  });
}

export function useScheduleCompletedQuery() {
  return useApiQuery<ScheduleCountResponse>({
    queryKey: ["dashboard", "schedule", "completed"],
    endpoint: "/dashboard/schedule/completed",
    method: "get",
  });
}

export function useScheduleTeamAvailabilityQuery() {
  return useApiQuery<any>({
    queryKey: ["dashboard", "schedule", "team-availability"],
    endpoint: "/dashboard/schedule/team-availability",
    method: "get",
  });
}

export function useScheduleLiveTimelineQuery() {
  return useApiQuery<any>({
    queryKey: ["dashboard", "schedule", "live-timeline"],
    endpoint: "/dashboard/schedule/live-timeline",
    method: "get",
  });
}

