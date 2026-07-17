import { keepPreviousData } from "@tanstack/react-query";
import { useApiQuery } from "../useApiQuery";

export interface EmployeeListFilters {
  status?: string[];
  company_name?: string[];
  plan_id?: string[];
  plan_type?: string[];
  relationship_type?: string[];
  parent_member_id?: string[];
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
    queryKey: ["member", variables],
    endpoint: "/member/list",
    method: "post",
    data: {
      search: variables.search || "",
      page: variables.page || 1,
      limit: variables.limit || 10,
      filters: variables.filters || {},
    },
    options: {
      enabled,
      staleTime: 0,
      refetchOnMount: "always",
      placeholderData: keepPreviousData,
    },
  });
}
