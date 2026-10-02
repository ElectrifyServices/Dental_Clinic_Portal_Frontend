import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export function useSalaryHistoryQuery(staffId: string | undefined) {
  return useApiQuery<ApiAny>({
    queryKey: ["salaryHistory", staffId],
    endpoint: `/staffPaymentHistory/${staffId}`,
    method: "post",
    options: {
      enabled: !!staffId,
    },
  });
}
