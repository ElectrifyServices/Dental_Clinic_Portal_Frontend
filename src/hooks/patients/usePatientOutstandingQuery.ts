import { useApiQuery } from "../useApiQuery";

export interface PatientOutstandingResponse {
  count: number;
  [key: string]: any;
}

export function usePatientOutstandingQuery() {
  return useApiQuery<PatientOutstandingResponse>({
    queryKey: ["patients", "outstanding"],
    endpoint: "/patient/stats/outstanding",
    method: "get",
  });
}
