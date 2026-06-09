import { useApiQuery } from "../useApiQuery";

export function useSalaryHistoryQuery(staffId: string | undefined) {
  return useApiQuery<any>({
    queryKey: ["salaryHistory", staffId],
    endpoint: `/staffPaymentHistory/${staffId}`,
    method: "post",
    options: {
      enabled: !!staffId,
    },
  });
}
