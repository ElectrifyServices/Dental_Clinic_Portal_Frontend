import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export function useAppointmentQuery(id?: string) {
  return useApiQuery<ApiAny>({
    queryKey: ["appointments", id],
    endpoint: `/appointment/${id}`,
    method: "get",
    options: {
      enabled: !!id,
      staleTime: 0,
      refetchOnMount: "always",
    }
  });
}
