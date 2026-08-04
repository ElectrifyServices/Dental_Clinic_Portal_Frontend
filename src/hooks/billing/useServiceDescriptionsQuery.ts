import { useApiQuery } from "../useApiQuery";

export interface ServiceDescriptionListParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, any>;
}

export function useServiceDescriptionsQuery(params: ServiceDescriptionListParams = {}, options?: any) {
  const body: Record<string, any> = {
    page: params.page ?? 1,
    limit: params.limit ?? 100,
  };

  if (params.search !== undefined && params.search !== "") {
    body.search = params.search;
  }

  if (params.filters && Object.keys(params.filters).length > 0) {
    body.filters = params.filters;
  }

  return useApiQuery<any>({
    queryKey: ["serviceDescriptions", body],
    endpoint: "/serviceDescription/list",
    method: "post",
    data: body,
    options: {
      staleTime: 5 * 60 * 1000,
      ...options,
    },
  });
}
