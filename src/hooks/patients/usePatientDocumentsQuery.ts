import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export function usePatientDocumentsQuery(patientId: string) {
  return useApiQuery<ApiAny>({
    queryKey: ["patientDocuments", patientId],
    endpoint: `/patient/documents/${patientId}`,
    method: "post",
    data: {},
    options: {
      enabled: !!patientId,
      refetchOnMount: "always",
    },
  });
}
