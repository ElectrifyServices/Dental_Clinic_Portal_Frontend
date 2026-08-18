import { useApiQuery } from "../useApiQuery";

export function usePatientMembershipQuery(patientId: string, options?: any) {
  return useApiQuery<any>({
    queryKey: ["patientMembership", patientId],
    endpoint: `/invoice/memberships?patient_id=${patientId}`,
    method: "get",
    options: {
      enabled: !!patientId,
      staleTime: 0,
      gcTime: 0,
      cacheTime: 0,
      refetchOnMount: "always",
      ...options,
    },
  });
}
