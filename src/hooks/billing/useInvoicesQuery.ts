import { useApiQuery } from "../useApiQuery";

export interface InvoiceListParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: {
    status?: string[];
    patient_id?: string[];
  };
}

export function useInvoicesQuery(params: InvoiceListParams = {}, options?: any) {
  const body: Record<string, any> = {
    page: params.page ?? 1,
    limit: params.limit ?? 100,
  };

  if (params.search !== undefined && params.search !== "") {
    body.search = params.search;
  }

  if (params.filters && Object.keys(params.filters).length > 0) {
    body.filters = params.filters;
  }

  return useApiQuery<any>({
    queryKey: ["invoices", body],
    endpoint: "/invoice/list",
    method: "post",
    data: body,
    options,
  });
}
