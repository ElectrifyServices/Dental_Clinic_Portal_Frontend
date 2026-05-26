import { useApiQuery } from "../useApiQuery";

export interface AppointmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: {
    status?: string;
    doctor_id?: string;
    patient_id?: string;
    date?: string;
    [key: string]: any;
  };
}

export interface Appointment {
  id: string;
  patient_id?: string;
  patient_name: string;
  patient_phone: string;
  date: string;
  start_time: string;
  specific_treatment?: string;
  slot_duration_mins?: number;
  treatment_cost?: number;
  concern?: string;
  notes?: string;
  status: string;
  doctor_id?: string;
  [key: string]: any;
}

export interface AppointmentListResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  limit: number;
}

export function useAppointmentsListQuery(params: AppointmentListParams = {}) {
  const body: Record<string, any> = {
    page: params.page ?? 1,
    limit: params.limit ?? 100,
  };

  if (params.search) {
    body.search = params.search;
  }

  if (params.filters) {
    body.filters = params.filters;
  }

  return useApiQuery<AppointmentListResponse | Appointment[]>({
    queryKey: ["appointments", "list", body],
    endpoint: "/appointment/list",
    method: "post",
    data: body,
  });
}
