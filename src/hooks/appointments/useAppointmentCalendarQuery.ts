import { useApiQuery } from "../useApiQuery";

export interface AppointmentCalendarData {
  year: number;
  month: number;
  appointments_by_date: Record<string, number>;
  total_appointments: number;
}

export interface AppointmentCalendarResponse {
  data: AppointmentCalendarData;
}

export function useAppointmentCalendarQuery(month: number, year: number) {
  return useApiQuery<AppointmentCalendarResponse>({
    queryKey: ["appointmentCalendar", month, year],
    endpoint: "/appointment/calendar",
    method: "get",
    params: {
      month: month,
      year: year,
    },
    options: {
      enabled: Boolean(month && year),
      refetchOnMount: "always",
    },
  });
}
