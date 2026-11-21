import { useApiQuery } from "../useApiQuery";
import apiClient from "@/services/apiClient";
import { parseApiResponse } from "@/services/parseApiResponse";

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

export async function checkPatientPhoneExists(phone: string) {
  const response = await apiClient.get(`/patient/phone-exists/${encodeURIComponent(phone.trim())}`);
  const parsed = parseApiResponse(response.data);
  return parsed.data;
}

