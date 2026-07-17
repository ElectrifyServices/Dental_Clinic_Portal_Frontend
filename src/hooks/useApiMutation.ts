import apiClient from "../services/apiClient";
import {
  parseApiResponse,
  type ApiResponse,
} from "../services/parseApiResponse";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

interface MutationProps<TData, TVariables> {
  endpoint?: string;
  getEndpoint?: (variables: TVariables) => string;
  method?: "get" | "post" | "put" | "patch" | "delete";
  options?: Omit<UseMutationOptions<TData, any, TVariables>, "mutationFn">;
  transformRequest?: (variables: TVariables) => any;
  headers?: any | ((variables: TVariables) => any);
}

export function useApiMutation<TData, TVariables = any>({
  endpoint,
  getEndpoint,
  method = "post",
  options,
  transformRequest,
  headers,
}: MutationProps<TData, TVariables>) {
  return useMutation<TData, any, TVariables>({
    mutationFn: async (variables) => {
      const resolvedEndpoint = getEndpoint?.(variables) ?? endpoint;
      if (!resolvedEndpoint) {
        throw new Error("No endpoint provided");
      }

      const requestData = transformRequest
        ? transformRequest(variables)
        : variables;

      const resolvedHeaders = typeof headers === "function"
        ? headers(variables)
        : headers;

      try {
        const res = await apiClient.request<ApiResponse<TData>>({
          url: resolvedEndpoint,
          method,
          data: requestData,
          headers: resolvedHeaders,
        });

        const parsed = parseApiResponse(res.data);
        
        // If the API structure uses status codes within the response body
        if (parsed.status && (parsed.status.statusCode < 200 || parsed.status.statusCode >= 300)) {
          const err: any = new Error(parsed.status.statusDesc || "API Error");
          err.data = parsed.data;
          err.status = parsed.status;
          throw err;
        }

        return parsed.data as TData;
      } catch (error: any) {
        const serverResponse = error.response?.data;
        if (serverResponse) {
          const parsed = parseApiResponse(serverResponse);
          if (parsed.status && parsed.status.statusDesc) {
            const err: any = new Error(parsed.status.statusDesc);
            err.data = parsed.data;
            err.status = parsed.status;
            throw err;
          }
        }
        throw error;
      }
    },
    ...options,
  });
}
