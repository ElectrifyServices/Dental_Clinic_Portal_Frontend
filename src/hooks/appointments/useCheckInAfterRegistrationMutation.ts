import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export function useCheckInAfterRegistrationMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, { id: string, patient_id: string }>({
    getEndpoint: (variables) => `/appointment/check-in-after-registration/${variables.id}`,
    method: "patch",
    transformRequest: (variables) => ({ patient_id: variables.patient_id }),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
        queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
        queryClient.invalidateQueries({ queryKey: ["appointmentCalendar"] });
      },
    },
  });
}
