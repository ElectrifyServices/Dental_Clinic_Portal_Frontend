import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export function useSingleStaffQuery(id?: string, options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && !!id;
  
  return useApiQuery<ApiAny>({
    queryKey: ["singleStaff", id],
    endpoint: `/staff/${id}`,
    method: "get",
    options: {
      enabled,
      staleTime: 0,
      gcTime: 0,
    },
  });
}
