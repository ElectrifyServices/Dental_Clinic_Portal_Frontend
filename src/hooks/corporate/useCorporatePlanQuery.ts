import { useApiQuery } from "../useApiQuery";

export function useCorporatePlanQuery(id?: string, options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && !!id;
  
  return useApiQuery<any>({
    queryKey: ["corporatePlan", id],
    endpoint: `/corporatePlan/${id}`,
    method: "get",
    options: {
      enabled,
      staleTime: 0,
    },
  });
}
