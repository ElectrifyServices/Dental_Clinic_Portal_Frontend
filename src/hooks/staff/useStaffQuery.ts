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
  [key: string]: any;
}

export interface StaffListParams {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export function useStaffQuery(params: StaffListParams = {}, options?: any) {
  const body: Record<string, any> = {};
  
  if (params.page !== undefined) {
    body.page = params.page;
  }
  if (params.limit !== undefined) {
    body.limit = params.limit;
  }
  if (params.page === undefined && params.limit === undefined) {
    body.all = true;
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
