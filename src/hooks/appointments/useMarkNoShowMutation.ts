import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export function useMarkNoShowMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, { id: string }>({
    getEndpoint: (variables) => `/appointment/no-show/${variables.id}`,
    method: "patch",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
        queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
        queryClient.invalidateQueries({ queryKey: ["appointmentCalendar"] });
      },
    },
  });
}
