import { useApiMutation } from "../useApiMutation";
import { AuthStorage } from "../../auth/authStorage";

export interface SendConsultationVariables {
  id: string;
  type: "CLINICAL" | "TREATMENT" | "PRESCRIPTION" | "FULL";
}

export function useSendConsultationMutation() {
  return useApiMutation<any, SendConsultationVariables>({
    getEndpoint: (variables) => {
      if (variables.type === "CLINICAL") {
        return `/consultations/${variables.id}/Observations`;
      }
      if (variables.type === "TREATMENT") {
        return `/consultations/${variables.id}/Treatment-plan`;
      }
      if (variables.type === "FULL") {
        return `/consultations/${variables.id}/send-full-summary`;
      }
      return `/consultations/${variables.id}/prescriptions`;
    },
    method: "post",
    headers: () => {
      const tenantId = AuthStorage.getUser()?.tenant_id || "";
      return {
        "x-tenant-id": tenantId,
      };
    },
    transformRequest: (variables) => {
      if (variables.type === "FULL") {
        return undefined;
      }
      return { type: variables.type };
    },
  });
}
