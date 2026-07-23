import { useApiMutation } from "../useApiMutation";
import { AuthStorage } from "../../auth/authStorage";

export interface SendWhatsappSessionVariables {
  id: string;
  sessionId: string;
}

export function useSendWhatsappSessionMutation() {
  return useApiMutation<any, SendWhatsappSessionVariables>({
    getEndpoint: (variables) => `/treatment/${variables.id}/sessions/${variables.sessionId}/send-whatsapp`,
    method: "post",
    headers: () => {
      const tenantId = AuthStorage.getUser()?.tenant_id || "";
      return {
        "x-tenant-id": tenantId,
      };
    },
  });
}
