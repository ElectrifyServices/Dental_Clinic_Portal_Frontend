import { useApiQuery } from "../useApiQuery";

export const useCheckEmployeeQuery = (phone: string, name: string, countryCode?: string) => {
  // Fire on either a usable phone (7+ digits) or a real name (3+ chars) —
  // previously this required BOTH, so typing just a name (no phone yet)
  // never looked up a matching member.
  const hasPhone = !!phone && phone.length >= 7;
  const hasName = !!name.trim() && name.trim().length >= 3;
  const enabled = hasPhone || hasName;
  const queryParams = new URLSearchParams();
  queryParams.append("phone", phone.trim());
  queryParams.append("name", name.trim());
  if (countryCode) {
    queryParams.append("country_code", countryCode.trim());
  }

  return useApiQuery<any>({
    queryKey: ["checkEmployee", phone, name, countryCode],
    endpoint: `/patient/check-member?${queryParams.toString()}`,
    method: "get",
    options: {
      enabled,
      retry: false, // Don't retry if employee not found (404)
      staleTime: 0,
      refetchOnMount: "always",
    },
  });
};
