import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateAppointmentVariables {
  id: string;
  payload: {
    doctor_id?: string;
    patient_id?: string;
    patient_name?: string;
    patient_phone?: string;
    date?: string;
    start_time?: string;
    specific_treatment?: string;
    treatment_type?: string;
    slot_duration_mins?: number;
    treatment_cost?: number;
    concern?: string;
    notes?: string;
    status?: string;
  };
}

export function useUpdateAppointmentMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, UpdateAppointmentVariables>({
    getEndpoint: (variables) => `/appointment/${variables.id}`,
    method: "put",
    transformRequest: (variables) => variables.payload,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
      },
    },
  });
}
