import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export interface BenefitUsageVariables {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, ApiAny>;
}

export function useBenefitUsageQuery(variables: BenefitUsageVariables, options?: ApiAny) {
  const enabled = options?.enabled ?? true;

  return useApiQuery<ApiAny>({
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
      staleTime: 0,
      gcTime: 0,
      cacheTime: 0,
      refetchOnMount: "always",
      refetchOnWindowFocus: false,
      ...options,
    },
  });
}
