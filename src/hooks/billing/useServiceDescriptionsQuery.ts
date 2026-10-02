import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export interface ServiceDescriptionListParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, ApiAny>;
}

export function useServiceDescriptionsQuery(params: ServiceDescriptionListParams = {}, options?: ApiAny) {
  const body: Record<string, ApiAny> = {
    page: params.page ?? 1,
    limit: params.limit ?? 100,
  };

  if (params.search !== undefined && params.search !== "") {
    body.search = params.search;
  }

  if (params.filters && Object.keys(params.filters).length > 0) {
    body.filters = params.filters;
  }

  return useApiQuery<ApiAny>({
    queryKey: ["billingDescriptions", body],
    endpoint: "/billingDescription/list",
    method: "post",
    data: body,
    options: {
      staleTime: 5 * 60 * 1000,
      ...options,
    },
  });
}
