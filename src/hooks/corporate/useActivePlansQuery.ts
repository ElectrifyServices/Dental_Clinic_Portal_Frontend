import { useApiQuery } from "../useApiQuery";

export function useActivePlansQuery(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  
  return useApiQuery<any>({
    queryKey: ["activePlans"],
    endpoint: "/employee/plans/active",
    method: "get",
    options: {
      enabled,
      staleTime: 5 * 60 * 1000,
      keepPreviousData: true,
    },
  });
}
