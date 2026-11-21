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

export function useTotalSuccessNotificationsQuery(phone?: string, options?: any) {
  const params: Record<string, any> = {};
  if (phone) {
    params.phone_no = phone;
  }
  return useApiQuery<any>({
    queryKey: ["notifications", "total-success", params.phone_no],
    endpoint: "/notifications/total-success",
    method: "get",
    params,
    options: {
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: "always",
      ...options,
    },
  });
}

export function useTotalFailedNotificationsQuery(phone?: string, options?: any) {
  const params: Record<string, any> = {};
  if (phone) {
    params.phone_no = phone;
  }
  return useApiQuery<any>({
    queryKey: ["notifications", "total-fail", params.phone_no],
    endpoint: "/notifications/total-fail",
    method: "get",
    params,
    options: {
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: "always",
      ...options,
    },
  });
}
