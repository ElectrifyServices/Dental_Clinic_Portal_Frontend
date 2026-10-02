import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";

export interface RegenerateInvoiceVariables {
  memberId: string;
  plan_id: string;
}

export function useRegenerateInvoiceMutation() {
  return useApiMutation<ApiAny, RegenerateInvoiceVariables>({
    getEndpoint: (variables) => `/invoice/regenerate/${variables.memberId}`,
    method: "post",
    transformRequest: ({ memberId: _memberId, ...rest }) => rest,
  });
}
