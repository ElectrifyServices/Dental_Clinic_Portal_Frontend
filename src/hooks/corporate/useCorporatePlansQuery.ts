import { useApiQuery } from "../useApiQuery";

export interface CorporatePlansResponse {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CorporatePlansParams {
  enabled?: boolean;
  search?: string;
  status?: string;
  planType?: string;
}

export function useCorporatePlansQuery(params: CorporatePlansParams = {}) {
  const enabled = params.enabled ?? false;
  const body: Record<string, any> = {
    page: 1,
    limit: 100,
  };

  if (params.search) {
    body.search = params.search;
  }

  if (params.status && params.status !== "ALL" || params.planType && params.planType !== "ALL") {
    body.filters = {};
    if (params.status && params.status !== "ALL") {
      body.filters.status = [params.status];
    }
    if (params.planType && params.planType !== "ALL") {
      body.filters.plan_type = [params.planType];
    }
  }

  return useApiQuery<CorporatePlansResponse>({
    queryKey: ["membershipPlans", body],
    endpoint: "/membershipPlan/list",
    method: "post",
    data: body,
    options: {
      enabled,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  });
}
