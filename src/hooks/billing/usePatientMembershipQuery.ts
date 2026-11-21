import { useApiQuery } from "../useApiQuery";

export function usePatientMembershipQuery(patientId: string, memberId?: string, options?: any) {
  let endpoint = `/invoice/memberships`;
  if (memberId) {
    endpoint += `?member_id=${memberId}`;
  } else {
    endpoint += `?patient_id=${patientId}`;
  }
  return useApiQuery<any>({
    queryKey: ["patientMembership", patientId, memberId],
    endpoint,
    method: "get",
    options: {
      enabled: !!patientId || !!memberId,
      staleTime: 0,
      gcTime: 0,
      cacheTime: 0,
      refetchOnMount: "always",
      ...options,
    },
  });
}
