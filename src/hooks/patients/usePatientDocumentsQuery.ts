import { useApiQuery } from "../useApiQuery";

export function usePatientDocumentsQuery(patientId: string) {
  return useApiQuery<any>({
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
