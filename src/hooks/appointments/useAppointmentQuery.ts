import { useApiQuery } from "../useApiQuery";

export function useAppointmentQuery(id?: string) {
  return useApiQuery<any>({
    queryKey: ["appointments", id],
    endpoint: `/appointment/${id}`,
    method: "get",
    options: {
      enabled: !!id,
    }
  });
}
