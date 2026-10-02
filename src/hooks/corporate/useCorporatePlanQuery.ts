import type { ApiRecord } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export function useCorporatePlanQuery(id?: string, options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && !!id;
  
  return useApiQuery<ApiRecord>({
    queryKey: ["corporatePlan", id],
    endpoint: `/membershipPlan/${id}`,
    method: "get",
    options: {
      enabled,
      staleTime: 0,
    },
  });
}
