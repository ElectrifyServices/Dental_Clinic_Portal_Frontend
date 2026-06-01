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

  if (params.status && params.status !== "ALL") {
    body.filters = {
      status: [params.status]
    };
  }

  return useApiQuery<CorporatePlansResponse>({
    queryKey: ["corporatePlans", body],
    endpoint: "/corporate/plan/list",
    method: "post",
    data: body,
    options: {
      enabled,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  });
}
