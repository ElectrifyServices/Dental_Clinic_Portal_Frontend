import { useApiQuery } from "../useApiQuery";

export function useEmployeeQuery(id?: string, options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && !!id;
  
  return useApiQuery<any>({
    queryKey: ["employee", id],
    endpoint: `/employee/${id}`,
    method: "get",
    options: {
      enabled,
      staleTime: 0,
    },
  });
}
