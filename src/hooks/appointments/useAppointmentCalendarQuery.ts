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

export function useAppointmentCalendarQuery(month: number, year: number, doctorId?: string | null) {
  return useApiQuery<AppointmentCalendarResponse>({
    queryKey: ["appointmentCalendar", month, year, doctorId],
    endpoint: "/appointment/calendar",
    method: "get",
    params: {
      month: month,
      year: year,
      doctor_id: doctorId,
    },
    options: {
      enabled: Boolean(month && year),
      refetchOnMount: "always",
    },
  });
}
