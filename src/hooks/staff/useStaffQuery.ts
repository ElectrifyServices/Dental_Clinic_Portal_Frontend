import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  specialization?: string;
  experience?: string;
  qualification?: string;
  status: string;
  permissions?: string[];
  [key: string]: ApiAny;
}

export interface StaffListParams {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export function useStaffQuery(params: StaffListParams = {}, options?: ApiAny) {
  const body: Record<string, ApiAny> = {};
  
  if (params.page !== undefined) {
    body.page = params.page;
  }
  if (params.limit !== undefined) {
    body.limit = params.limit;
  }
  if (params.page === undefined && params.limit === undefined) {
    body.all = true;
    body.limit = 1000;
  }

  if (params.search) {
    body.search = params.search;
  }
  if (params.role && params.role !== "all") {
    body.filters = {
      roles: [params.role.toUpperCase()]
    };
  }

  return useApiQuery<StaffMember[]>({
    queryKey: ["staff", body],
    endpoint: "/staff/list",
    method: "post",
    data: body,
    options,
  });
}
