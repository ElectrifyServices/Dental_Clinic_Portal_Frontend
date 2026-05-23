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

export function useCorporatePlansQuery(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? false;
  return useApiQuery<CorporatePlansResponse>({
    queryKey: ["corporatePlans"],
    endpoint: "/corporate/plan/list",
    method: "post",
    data: {
      page: 1,
      limit: 10,
      search: "",
      status: "ACTIVE",
    },
    options: {
      enabled,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  });
}
