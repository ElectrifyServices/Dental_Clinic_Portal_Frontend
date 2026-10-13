import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export function useSalaryHistoryQuery(staffId: string | undefined) {
  return useApiQuery<ApiAny>({
    queryKey: ["salaryHistory", staffId],
    endpoint: `/staffPaymentHistory/${staffId}`,
    method: "post",
    data: {},
    options: {
      enabled: !!staffId,
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: "always",
    },
  });
}
