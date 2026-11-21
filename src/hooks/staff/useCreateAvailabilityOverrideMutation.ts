import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { AuthStorage } from "../../auth/authStorage";

export interface CreateAvailabilityOverridePayload {
  date: string;
  /** Omit both to block the whole day. */
  start_time?: string;
  end_time?: string;
  reason?: string;
}

export interface CreateAvailabilityOverrideVariables {
  doctorId: string;
  payload: CreateAvailabilityOverridePayload;
}

export function useCreateAvailabilityOverrideMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, CreateAvailabilityOverrideVariables>({
    getEndpoint: (variables) => `/doctorSchedule/${variables.doctorId}/exceptions`,
    method: "post",
    transformRequest: (variables) => variables.payload,
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
