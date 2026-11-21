import { useApiQuery } from "../useApiQuery";

export function useTotalBilledQuery() {
  return useApiQuery<any>({
    queryKey: ["invoices", "stats", "total-billed"],
    endpoint: "/invoice/stats/total-billed",
    method: "get",
  });
}

export function usePendingInvoicesQuery() {
  return useApiQuery<any>({
    queryKey: ["invoices", "stats", "pending-invoices"],
    endpoint: "/invoice/stats/pending-invoices",
    method: "get",
  });
}

export function usePaidInvoicesQuery() {
  return useApiQuery<any>({
    queryKey: ["invoices", "stats", "paid"],
    endpoint: "/invoice/stats/paid",
    method: "get",
  });
}
