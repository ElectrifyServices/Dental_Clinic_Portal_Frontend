import { useApiQuery } from "../useApiQuery";
import { ConsultationResponse } from "./consultationTypes";

export function useConsultationQuery(id?: string, options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && !!id;

  return useApiQuery<ConsultationResponse>({
    queryKey: ["consultation", id],
    endpoint: id ? `/consultations/${id}` : "/consultations",
    method: "get",
    options: {
      enabled,
      staleTime: 30 * 1000,
    },
  });
}
