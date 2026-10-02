import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export interface AppointmentStatsResponse {
  count?: number;
  total?: number;
  [key: string]: ApiAny;
}

export function useAppointmentTotalVolumeQuery(startDate?: string, endDate?: string, doctorId?: string | null) {
  const queryKey: ApiAny[] = ["appointments", "stats", "total-volume"];
  const params: Record<string, string> = {};

  if (startDate) {
    queryKey.push(startDate);
    params.startDate = startDate;
  }
  if (endDate) {
    queryKey.push(endDate);
    params.endDate = endDate;
  }
  if (doctorId) {
    queryKey.push(doctorId);
    params.doctorId = doctorId;
    params.doctor_id = doctorId;
  }

  return useApiQuery<AppointmentStatsResponse>({
    queryKey,
    endpoint: "/appointment/stats/total-volume",
    method: "get",
    params,
  });
}

export function useAppointmentUpcomingQuery(startDate?: string, endDate?: string, doctorId?: string | null) {
  const queryKey: ApiAny[] = ["appointments", "stats", "upcoming"];
  const params: Record<string, string> = {};

  if (startDate) {
    queryKey.push(startDate);
    params.startDate = startDate;
  }
  if (endDate) {
    queryKey.push(endDate);
    params.endDate = endDate;
  }
  if (doctorId) {
    queryKey.push(doctorId);
    params.doctorId = doctorId;
    params.doctor_id = doctorId;
  }

  return useApiQuery<AppointmentStatsResponse>({
    queryKey,
    endpoint: "/appointment/stats/upcoming",
    method: "get",
    params,
  });
}

export function useAppointmentCompletedQuery(startDate?: string, endDate?: string, doctorId?: string | null) {
  const queryKey: ApiAny[] = ["appointments", "stats", "completed"];
  const params: Record<string, string> = {};

  if (startDate) {
    queryKey.push(startDate);
    params.startDate = startDate;
  }
  if (endDate) {
    queryKey.push(endDate);
    params.endDate = endDate;
  }
  if (doctorId) {
    queryKey.push(doctorId);
    params.doctorId = doctorId;
    params.doctor_id = doctorId;
  }

  return useApiQuery<AppointmentStatsResponse>({
    queryKey,
    endpoint: "/appointment/stats/completed",
    method: "get",
    params,
  });
}

export function useAppointmentCancelledQuery(startDate?: string, endDate?: string, doctorId?: string | null) {
  const queryKey: ApiAny[] = ["appointments", "stats", "cancelled"];
  const params: Record<string, string> = {};

  if (startDate) {
    queryKey.push(startDate);
    params.startDate = startDate;
  }
  if (endDate) {
    queryKey.push(endDate);
    params.endDate = endDate;
  }
  if (doctorId) {
    queryKey.push(doctorId);
    params.doctorId = doctorId;
    params.doctor_id = doctorId;
  }

  return useApiQuery<AppointmentStatsResponse>({
    queryKey,
    endpoint: "/appointment/stats/cancelled",
    method: "get",
    params,
  });
}
