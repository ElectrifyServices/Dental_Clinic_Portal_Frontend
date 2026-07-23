import { useApiQuery } from "../useApiQuery";

export interface ProcedureListParams {
  page?: number;
  limit?: number;
  all?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  filters?: {
    status?: string[];
    createdBy?: string[];
  };
}

export interface Procedure {
  id: string;
  tenant_id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  created_by?: string | null;
  updated_by?: string | null;
  deleted_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export function useProcedureQuery(params: ProcedureListParams = {}, options?: any) {
  const body: Record<string, any> = {};

  if (params.page !== undefined) body.page = params.page;
  if (params.limit !== undefined) body.limit = params.limit;
  if (params.all !== undefined) body.all = params.all;
  if (params.search !== undefined && params.search !== "") body.search = params.search;
  if (params.sortBy !== undefined) body.sortBy = params.sortBy;
  if (params.sortOrder !== undefined) body.sortOrder = params.sortOrder;
  if (params.filters && Object.keys(params.filters).length > 0) body.filters = params.filters;

  return useApiQuery<Procedure[]>({
    queryKey: ["procedures", body],
    endpoint: "/procedures/list",
    method: "post",
    data: body,
    options,
  });
}
