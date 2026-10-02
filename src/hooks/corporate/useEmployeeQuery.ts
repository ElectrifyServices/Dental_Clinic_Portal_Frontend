import type { ApiRecord } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export function useEmployeeQuery(id?: string, options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && !!id;
  
  return useApiQuery<ApiRecord>({
    queryKey: ["member", id],
    endpoint: `/member/${id}`,
    method: "get",
    options: {
      enabled,
      staleTime: 0,
    },
  });
}
