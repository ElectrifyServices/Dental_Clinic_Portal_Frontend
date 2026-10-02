import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { AuthStorage } from "../../auth/authStorage";

export interface SendWhatsappTreatmentVariables {
  id: string;
}

export function useSendWhatsappTreatmentMutation() {
  return useApiMutation<ApiAny, SendWhatsappTreatmentVariables>({
    getEndpoint: (variables) => `/treatment/${variables.id}/send-whatsapp`,
    method: "post",
    headers: () => {
      const tenantId = AuthStorage.getUser()?.tenant_id || "";
      return {
        "x-tenant-id": tenantId,
      };
    },
  });
}
