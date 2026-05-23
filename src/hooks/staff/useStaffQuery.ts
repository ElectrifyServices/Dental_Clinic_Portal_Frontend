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

export function useStaffQuery() {
  return useApiQuery<StaffMember[]>({
    queryKey: ["staff"],
    endpoint: "/staff/list",
    method: "post",
    data: { all: true }, // As per standard list APIs in this project
  });
}
