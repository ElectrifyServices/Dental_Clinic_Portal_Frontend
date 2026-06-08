import { useApiQuery } from "../useApiQuery";

export interface PhoneExistsResponse {
  responseStatusList?: {
    statusList: Array<{
      statusCode: number;
      statusType: string;
      statusDesc: string;
    }>;
  };
  responseObject?: {
    data: {
      exists: boolean;
      patient?: {
        id: string;
        name: string;
        phone: string;
        email?: string;
        [key: string]: any;
      };
    };
  };
}

export function usePatientPhoneExistsQuery(phone: string, enabled = false) {
  return useApiQuery<PhoneExistsResponse>({
    queryKey: ["patients", "phone-exists", phone],
    endpoint: `/patient/phone-exists/${phone}`,
    method: "get",
    options: {
      enabled: !!phone && enabled,
      staleTime: 0,
    },
  });
}
