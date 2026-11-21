import { useApiQuery } from "../useApiQuery";

export function useEmployeeQuery(id?: string, options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && !!id;
  
  return useApiQuery<any>({
    queryKey: ["member", id],
    endpoint: `/member/${id}`,
    method: "get",
    options: {
      enabled,
      staleTime: 0,
    },
  });
}
