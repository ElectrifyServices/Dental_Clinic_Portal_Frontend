import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface DeleteAppointmentVariables {
  id: string;
}

export function useDeleteAppointmentMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, DeleteAppointmentVariables>({
    getEndpoint: (variables) => `/appointment/${variables.id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
        queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
        queryClient.invalidateQueries({ queryKey: ["appointmentCalendar"] });
      },
    },
  });
}
