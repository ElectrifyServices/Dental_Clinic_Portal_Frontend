import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export interface PatientTotalResponse {
  total: number;
  [key: string]: ApiAny;
}

export function usePatientTotalQuery() {
  return useApiQuery<PatientTotalResponse>({
    queryKey: ["patients", "total"],
    endpoint: "/patient/stats/total",
    method: "get",
  });
}
