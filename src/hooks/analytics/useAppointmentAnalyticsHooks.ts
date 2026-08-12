import { useApiQuery } from "../useApiQuery";
import apiClient from "../../services/apiClient";
export interface AppointmentAnalyticsFilter {
  timeRange?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 1. Total Bookings API
 * Endpoint: POST /appointmentAnalytics/total-bookings
 */
export function useTotalBookingsAnalyticsQuery(filter: AppointmentAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["appointmentAnalytics", "total-bookings", filter],
    endpoint: "/appointmentAnalytics/total-bookings",
    method: "post",
    data: filter,
  });
}

/**
 * 2. Completed API
 * Endpoint: POST /appointmentAnalytics/completed
 */
export function useCompletedBookingsAnalyticsQuery(filter: AppointmentAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["appointmentAnalytics", "completed", filter],
    endpoint: "/appointmentAnalytics/completed",
    method: "post",
    data: filter,
  });
}

/**
 * 3. No Show Rate API
 * Endpoint: POST /appointmentAnalytics/no-show-rate
 */
export function useNoShowRateAnalyticsQuery(filter: AppointmentAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["appointmentAnalytics", "no-show-rate", filter],
    endpoint: "/appointmentAnalytics/no-show-rate",
    method: "post",
    data: filter,
  });
}

/**
 * 4. Completion Rate API
 * Endpoint: POST /appointmentAnalytics/completion-rate
 */
export function useApptCompletionRateAnalyticsQuery(filter: AppointmentAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["appointmentAnalytics", "completion-rate", filter],
    endpoint: "/appointmentAnalytics/completion-rate",
    method: "post",
    data: filter,
  });
}

/**
 * 5. Peak Hours Heatmap API
 * Endpoint: POST /appointmentAnalytics/peak-hours-heatmap
 */
export function usePeakHoursHeatmapAnalyticsQuery(filter: AppointmentAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["appointmentAnalytics", "peak-hours-heatmap", filter],
    endpoint: "/appointmentAnalytics/peak-hours-heatmap",
    method: "post",
    data: filter,
  });
}

/**
 * 6. Next 7 Day Forecast API
 * Endpoint: POST /appointmentAnalytics/next-7-day-forecast
 */
export function useNext7DayForecastAnalyticsQuery(filter: AppointmentAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["appointmentAnalytics", "next-7-day-forecast", filter],
    endpoint: "/appointmentAnalytics/next-7-day-forecast",
    method: "post",
    data: filter,
  });
}

export const exportAppointmentAnalytics = async (filter: any) => {
  return apiClient.post("/appointmentAnalytics/export", { ...filter, format: "xlsx" }, { responseType: "blob" });
};
