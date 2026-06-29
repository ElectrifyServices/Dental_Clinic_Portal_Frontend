// hooks/treatment/useTreatmentPlanQuery.ts
import { useApiQuery } from "../useApiQuery";
import { TreatmentPlanResponse } from "./useCreateTreatmentPlanMutation";

export function useTreatmentPlanQuery(id?: string, options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && !!id;

  return useApiQuery<TreatmentPlanResponse>({
    queryKey: ["treatmentPlan", id],
    endpoint: `/treatment/${id}`,
    method: "get",
    options: {
      enabled,
      staleTime: 0,
    },
  });
}