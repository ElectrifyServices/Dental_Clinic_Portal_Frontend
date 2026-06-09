import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CreateAppointmentPayload {
  doctor_id: string;
  patient_id?: string;
  patient_name: string;
  patient_phone: string;
  date: string;
  start_time: string;
  specific_treatment?: string;
  treatment_type?: string;
  slot_duration_mins: number;
  treatment_cost?: number;
  concern?: string;
  notes?: string;
  status: string;
}

export interface CreateAppointmentResponse {
  id: string;
  [key: string]: any;
}

export function useCreateAppointmentMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<CreateAppointmentResponse, CreateAppointmentPayload>({
    endpoint: "/appointment/create",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
        queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
        queryClient.invalidateQueries({ queryKey: ["appointmentCalendar"] });
      },
    },
  });
}
