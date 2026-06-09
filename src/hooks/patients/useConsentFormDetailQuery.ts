import { useApiQuery } from "../useApiQuery";

export function useConsentFormDetailQuery(id?: string, enabled: boolean = false) {
  return useApiQuery<any>({
    queryKey: ["consentForm", id],
    endpoint: `/consentForm/${id}`,
    method: "get",
    options: {
      enabled: enabled && !!id,
    },
  });
}
