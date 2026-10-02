import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { AuthStorage } from "../../auth/authStorage";

export interface SendSessionPrescriptionVariables {
  id: string;
  sessionId: string;
}

export function useSendSessionPrescriptionMutation() {
  return useApiMutation<ApiAny, SendSessionPrescriptionVariables>({
    getEndpoint: (variables) => `/treatment/${variables.id}/sessions/${variables.sessionId}/send-prescription`,
    method: "post",
    headers: () => {
      const tenantId = AuthStorage.getUser()?.tenant_id || "";
      return {
        "x-tenant-id": tenantId,
      };
    },
  });
}
