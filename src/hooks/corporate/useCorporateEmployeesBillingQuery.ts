import { useApiQuery } from "../useApiQuery";

export function useCorporateEmployeesBillingQuery(planId: string, options?: any) {
  return useApiQuery<any>({
    queryKey: ["corporateEmployeesBilling", planId],
    endpoint: `/membershipPlan/${planId}/enrolled-employees`,
    method: "get",
    options: {
      enabled: !!planId,
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: "always",
      ...options,
    },
  });
}
