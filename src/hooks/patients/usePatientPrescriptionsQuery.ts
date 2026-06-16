import { useApiQuery } from "../useApiQuery";

export interface PrescriptionFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function usePatientPrescriptionsQuery(patientId: string, filters: PrescriptionFilters = {}, enabled = true) {
  return useApiQuery<any>({
    queryKey: ["patients", "prescriptions", patientId, filters],
    endpoint: `/patient/prescriptions/${patientId}`,
    method: "get",
    params: {
      search: filters.search ?? "",
      status: filters.status ?? "ACTIVE",
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
    },
    options: {
      enabled: !!patientId && enabled,
    },
  });
}
