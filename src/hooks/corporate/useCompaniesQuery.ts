import { useApiQuery } from "../useApiQuery";

export interface CompanyResponse {
  name: string;
  count: number;
}

export function useCompaniesQuery(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;

  return useApiQuery<any>({
    queryKey: ["companies"],
    endpoint: "/employee/companies/list",
    method: "get",
    options: {
      enabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  });
}
