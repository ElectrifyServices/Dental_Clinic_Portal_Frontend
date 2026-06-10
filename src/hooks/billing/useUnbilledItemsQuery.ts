import { useApiQuery } from "../useApiQuery";

export function useUnbilledItemsQuery(patientId: string, options?: any) {
  return useApiQuery<any>({
    queryKey: ["unbilledItems", patientId],
    endpoint: `/invoice/unbilled-items/${patientId}`,
    method: "get",
    options,
  });
}
