import { useApiQuery } from "../useApiQuery";

export interface EmployeeListFilters {
  status?: string[];
  company_name?: string[];
  corporate_plan_id?: string[];
}

export interface EmployeeListVariables {
  search?: string;
  page?: number;
  limit?: number;
  filters?: EmployeeListFilters;
}

export interface EmployeeListResponse {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useEmployeesQuery(variables: EmployeeListVariables, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  
  return useApiQuery<EmployeeListResponse>({
    queryKey: ["employees", variables],
    endpoint: "/employee/list",
    method: "post",
    data: {
      search: variables.search || "",
      page: variables.page || 1,
      limit: variables.limit || 10,
      filters: variables.filters || {},
    },
    options: {
      enabled,
      staleTime: 5 * 60 * 1000,
      keepPreviousData: true,
    },
  });
}
