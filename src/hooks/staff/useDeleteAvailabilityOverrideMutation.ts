import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { AuthStorage } from "../../auth/authStorage";

export interface DeleteAvailabilityOverrideVariables {
  doctorId: string;
  overrideId: string;
}

export function useDeleteAvailabilityOverrideMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, DeleteAvailabilityOverrideVariables>({
    getEndpoint: (variables) => `/doctorSchedule/${variables.doctorId}/exceptions/${variables.overrideId}`,
    method: "delete",
    headers: () => {
      const tenantId = AuthStorage.getUser()?.tenant_id || "";
      return {
        "x-tenant-id": tenantId,
      };
    },
    options: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["availabilityOverrides", variables.doctorId] });
        queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      },
    },
  });
}
