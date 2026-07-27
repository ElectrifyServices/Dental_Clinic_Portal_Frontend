import { useApiQuery } from "../useApiQuery";

export interface AppointmentStatsResponse {
  count?: number;
  total?: number;
  [key: string]: any;
}

// Helper to get start and end dates of the current month in YYYY-MM-DD format
function getCurrentMonthDates() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const startDate = `${year}-${month}-01`;
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
  return { startDate, endDate };
}

export function useAppointmentTotalVolumeQuery(startDate?: string, endDate?: string) {
  const { startDate: defaultStart, endDate: defaultEnd } = getCurrentMonthDates();
  const start = startDate || defaultStart;
  const end = endDate || defaultEnd;

  return useApiQuery<AppointmentStatsResponse>({
    queryKey: ["appointments", "stats", "total-volume", start, end],
    endpoint: "/appointments/stats/total-volume",
    method: "get",
    params: { startDate: start, endDate: end },
  });
}

export function useAppointmentUpcomingQuery(startDate?: string, endDate?: string) {
  const { startDate: defaultStart, endDate: defaultEnd } = getCurrentMonthDates();
  const start = startDate || defaultStart;
  const end = endDate || defaultEnd;

  return useApiQuery<AppointmentStatsResponse>({
    queryKey: ["appointments", "stats", "upcoming", start, end],
    endpoint: "/appointments/stats/upcoming",
    method: "get",
    params: { startDate: start, endDate: end },
  });
}

export function useAppointmentCompletedQuery(startDate?: string, endDate?: string) {
  const { startDate: defaultStart, endDate: defaultEnd } = getCurrentMonthDates();
  const start = startDate || defaultStart;
  const end = endDate || defaultEnd;

  return useApiQuery<AppointmentStatsResponse>({
    queryKey: ["appointments", "stats", "completed", start, end],
    endpoint: "/appointments/stats/completed",
    method: "get",
    params: { startDate: start, endDate: end },
  });
}

export function useAppointmentCancelledQuery(startDate?: string, endDate?: string) {
  const { startDate: defaultStart, endDate: defaultEnd } = getCurrentMonthDates();
  const start = startDate || defaultStart;
  const end = endDate || defaultEnd;

  return useApiQuery<AppointmentStatsResponse>({
    queryKey: ["appointments", "stats", "cancelled", start, end],
    endpoint: "/appointments/stats/cancelled",
    method: "get",
    params: { startDate: start, endDate: end },
  });
}
