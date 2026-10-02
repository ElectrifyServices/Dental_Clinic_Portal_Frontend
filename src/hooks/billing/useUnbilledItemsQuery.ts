import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export function useUnbilledItemsQuery(patientId: string, memberId?: string, options?: ApiAny) {
  let endpoint = `/invoice/unbilled-items`;
  if (memberId) {
    endpoint += `?member_id=${memberId}`;
  } else {
    endpoint += `?patientId=${patientId}`;
  }
  return useApiQuery<ApiAny>({
    queryKey: ["unbilledItems", patientId, memberId],
    endpoint,
    method: "get",
    options: {
      staleTime: 0,
      gcTime: 0,
      cacheTime: 0,
      refetchOnMount: "always",
      ...options,
    },
  });
}
