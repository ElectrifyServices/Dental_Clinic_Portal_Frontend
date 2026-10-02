import type { ApiAny } from "../../types/api";
import { useApiQuery, type ApiQueryOptions } from "../useApiQuery";

export interface LabName {
  id: string;
  name: string;
  is_active?: boolean;
  [key: string]: ApiAny;
}

export interface LabNameListParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: {
    is_active?: boolean;
  };
}

export function useLabNamesQuery(
  params: LabNameListParams = {},
  options?: ApiQueryOptions<ApiAny>,
) {
  const queryParams: Record<string, unknown> = {};
  if (params.page !== undefined) queryParams.page = params.page;
  if (params.limit !== undefined) queryParams.limit = params.limit;
  if (params.search !== undefined && params.search !== "") queryParams.search = params.search;
  if (params.filters !== undefined) queryParams.filters = params.filters;

  return useApiQuery<ApiAny>({
    queryKey: ["labNames", queryParams],
    endpoint: "/labName/list",
    method: "post",
    data: queryParams,
    options,
  });
}
