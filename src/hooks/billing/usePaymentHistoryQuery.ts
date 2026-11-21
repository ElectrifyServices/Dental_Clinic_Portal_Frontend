import { useApiQuery } from "../useApiQuery";

export function usePaymentHistoryQuery(invoiceId: string, options?: any) {
  return useApiQuery<any>({
    queryKey: ["paymentHistory", invoiceId],
    endpoint: `/invoice/payment-history/${invoiceId}`,
    method: "get",
    options: {
      enabled: !!invoiceId,
      staleTime: 0,
      gcTime: 0,
      cacheTime: 0,
      refetchOnMount: "always",
      ...options,
    },
  });
}
