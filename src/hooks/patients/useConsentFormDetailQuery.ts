import { useApiQuery } from "../useApiQuery";

export function useConsentFormDetailQuery(id?: string, enabled: boolean = false) {
  return useApiQuery<any>({
    queryKey: ["consent", id],
    endpoint: `/consent/${id}`,
    method: "get",
    options: {
      enabled: enabled && !!id,
    },
  });
}
