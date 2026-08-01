import { useApiQuery } from "../useApiQuery";

export interface BenefitUsageVariables {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, any>;
}

export function useBenefitUsageQuery(variables: BenefitUsageVariables, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;

  return useApiQuery<any>({
    queryKey: ["benefit-usage", variables],
    endpoint: "/invoice/benefit-usage",
    method: "post",
    data: {
      page: variables.page || 1,
      limit: variables.limit || 10,
      search: variables.search || "",
      filters: variables.filters || {},
    },
    options: {
      enabled,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  });
}
