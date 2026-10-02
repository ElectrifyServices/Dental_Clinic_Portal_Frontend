import type { ApiAny } from "../../types/api";
import { useApiQuery, type ApiQueryOptions } from "../useApiQuery";

export interface LabWorkListParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: {
    status?: string[];
    patient_id?: string[];
  };
}

export function useLabWorksQuery(
  params: LabWorkListParams = {},
  options?: ApiQueryOptions<ApiAny>,
) {
  const body: Record<string, unknown> = {
    page: params.page ?? 1,
    limit: params.limit ?? 1000,
  };

  if (params.search !== undefined && params.search !== "") {
    body.search = params.search;
  }

  if (params.filters && Object.keys(params.filters).length > 0) {
    body.filters = params.filters;
  }

  return useApiQuery<ApiAny>({
    queryKey: ["labWorks", body],
    endpoint: "/labWork/list",
    method: "post",
    data: body,
    options,
  });
}
