import { useApiQuery } from "../useApiQuery";

export interface PatientNewResponse {
  count: number;
  [key: string]: any;
}

export function usePatientNewQuery() {
  return useApiQuery<PatientNewResponse>({
    queryKey: ["patients", "new"],
    endpoint: "/patient/stats/new",
    method: "get",
  });
}
