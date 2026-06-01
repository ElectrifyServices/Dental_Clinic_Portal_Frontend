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
}

export function useStaffQuery(params: StaffListParams = {}) {
  const body: Record<string, any> = { all: true };
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
  });
}
