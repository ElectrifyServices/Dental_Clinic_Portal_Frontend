import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import { AuthStorage } from "../../auth/authStorage";

export interface DeleteTreatmentPlanVariables {
  id: string;
}

export interface DeleteTreatmentPlanResponse {
  message: string;
}

/**
 * DELETE /treatment/:id
 *
 * IMPORTANT: This endpoint does NOT use the standard responseStatusList/responseObject envelope.
 * It returns raw: { "message": "Treatment plan deleted" }
 * So we bypass parseApiResponse and read the response directly.
 */
export function useDeleteTreatmentPlanMutation() {
  const queryClient = useQueryClient();

  return useMutation<DeleteTreatmentPlanResponse, any, DeleteTreatmentPlanVariables>({
    mutationFn: async (variables) => {
      const user = AuthStorage.getUser();
      const staffId = user?.id;

      const headers: Record<string, string> = {};
      if (staffId) headers["x-staff-id"] = staffId;

      const res = await apiClient.request<DeleteTreatmentPlanResponse>({
        url: `/treatment/${variables.id}`,
        method: "delete",
        headers,
      });

      // Raw response — not wrapped in standard envelope
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["treatmentPlans"] });
      queryClient.invalidateQueries({ queryKey: ["patientTreatmentPlans"] });
      queryClient.invalidateQueries({ queryKey: ["treatmentPlan", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["treatmentPlanStats"] });
    },
  });
}
