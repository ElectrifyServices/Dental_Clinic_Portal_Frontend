import { useApiQuery } from "../useApiQuery";

export function useNotificationsQuery(options?: any) {
  return useApiQuery<any>({
    queryKey: ["notifications"],
    endpoint: "/notifications/list",
    method: "post",
    data: { page: 1, limit: 100 },
    options: {
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: "always",
      ...options,
    },
  });
}
