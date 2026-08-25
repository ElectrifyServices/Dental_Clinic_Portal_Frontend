import { useApiQuery } from "../useApiQuery";

export const useCheckEmployeeQuery = (phone: string, name: string, countryCode?: string) => {
  const enabled = !!phone && phone.length >= 7 && !!name.trim();
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
    },
  });
};
