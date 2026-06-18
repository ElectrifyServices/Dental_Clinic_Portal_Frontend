import { useApiQuery } from "../useApiQuery";

export const useCheckEmployeeQuery = (phone: string) => {
  const enabled = !!phone && phone.length >= 10;
  return useApiQuery<any>({
    queryKey: ["checkEmployee", phone],
    endpoint: `/patient/check-member/${phone}`,
    method: "get",
    options: {
      enabled,
      retry: false, // Don't retry if employee not found (404)
    },
  });
};
