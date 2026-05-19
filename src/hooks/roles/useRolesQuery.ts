import { useApiQuery } from "../useApiQuery";

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
