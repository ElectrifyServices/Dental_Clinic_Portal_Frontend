import { useApiQuery } from "../useApiQuery";
import apiClient from "@/services/apiClient";
import { parseApiResponse } from "@/services/parseApiResponse";

export interface Role {
  id: string;
  name: string;
  description: string;
  [key: string]: any;
}

export function useRolesQuery() {
  return useApiQuery<Role[]>({
    queryKey: ["roles"],
    endpoint: "/role/list",
    method: "post",
    data: { all: true },
  });
}

export async function fetchRolesList() {
  const res = await apiClient.post("/role/list", { all: true });
  const parsed = parseApiResponse(res.data);
  return parsed.responseObject ?? parsed.data ?? res.data;
}

