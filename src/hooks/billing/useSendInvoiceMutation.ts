import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface SendInvoiceVariables {
  id: string;
}

export function useSendInvoiceMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, SendInvoiceVariables>({
    getEndpoint: (variables) => `/invoice/send/${variables.id}`,
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        queryClient.invalidateQueries({ queryKey: ["invoice"] });
      },
    },
  });
}
