import type { ApiRecord } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export function useTotalBilledQuery() {
  return useApiQuery<ApiRecord>({
    queryKey: ["invoices", "stats", "total-billed"],
    endpoint: "/invoice/stats/total-billed",
    method: "get",
  });
}

export function usePendingInvoicesQuery() {
  return useApiQuery<ApiRecord>({
    queryKey: ["invoices", "stats", "pending-invoices"],
    endpoint: "/invoice/stats/pending-invoices",
    method: "get",
  });
}

export function usePaidInvoicesQuery() {
  return useApiQuery<ApiRecord>({
    queryKey: ["invoices", "stats", "paid"],
    endpoint: "/invoice/stats/paid",
    method: "get",
  });
}
