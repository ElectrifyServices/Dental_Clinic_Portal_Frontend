import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export function useConsentFormDetailQuery(id?: string, enabled: boolean = false) {
  return useApiQuery<ApiAny>({
    queryKey: ["consent", id],
    endpoint: `/consent/${id}`,
    method: "get",
    options: {
      enabled: enabled && !!id,
    },
  });
}
