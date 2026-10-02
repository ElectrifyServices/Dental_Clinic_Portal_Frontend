import type { ApiAny } from "../types/api";
import apiClient from "../services/apiClient";
import {
  parseApiResponse,
  type ApiResponse,
} from "../services/parseApiResponse";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

interface QueryProps<TData> {
  queryKey: ApiAny[];
  endpoint: string;
  method?: "get" | "post" | "put" | "patch" | "delete";
  params?: Record<string, ApiAny>;
  data?: ApiAny;
  options?: Omit<UseQueryOptions<TData | null, ApiAny>, "queryKey" | "queryFn">;
}

/** The react-query options a caller may forward to {@link useApiQuery}. */
export type ApiQueryOptions<TData> = QueryProps<TData>["options"];

export function useApiQuery<TData>({
  queryKey,
  endpoint,
  method = "get",
  params,
  data,
  options,
}: QueryProps<TData>) {
  return useQuery<TData | null>({
    queryKey,
    queryFn: async (): Promise<TData | null> => {
      const res = await apiClient.request<ApiResponse<TData>>({
        url: endpoint,
        method,
        params,
        data,
      });

      const parsed = parseApiResponse(res.data);

      // If the API structure uses status codes within the response body
      if (parsed.status && (parsed.status.statusCode < 200 || parsed.status.statusCode >= 300)) {
        throw parsed.data || new Error(parsed.status.statusDesc);
      }
      
      return parsed.data;
    },
    ...options,
  });
}
