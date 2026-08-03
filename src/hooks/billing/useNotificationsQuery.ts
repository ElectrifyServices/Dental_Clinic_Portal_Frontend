import { useApiQuery } from "../useApiQuery";

export interface NotificationListParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: {
    status?: string;
    template_name?: string;
  };
}

export function useNotificationsQuery(params: NotificationListParams = {}, options?: any) {
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
    queryKey: ["notifications", body],
    endpoint: "/notifications/list",
    method: "post",
    data: body,
    options: {
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: "always",
      ...options,
    },
  });
}
