import { useApiQuery } from "../useApiQuery";

export function useUnbilledItemsQuery(patientId: string, memberId?: string, options?: any) {
  let endpoint = `/invoice/unbilled-items`;
  if (memberId) {
    endpoint += `?member_id=${memberId}`;
  } else {
    endpoint += `?patientId=${patientId}`;
  }
  return useApiQuery<any>({
    queryKey: ["unbilledItems", patientId, memberId],
    endpoint,
    method: "get",
    options,
  });
}
