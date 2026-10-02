import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export function useCheckInAppointmentMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<ApiAny, { id: string }>({
    getEndpoint: (variables) => `/appointment/check-in-patient/${variables.id}`,
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
