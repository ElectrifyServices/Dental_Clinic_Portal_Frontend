import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface DeleteInvoiceVariables {
  id: string;
}

export function useDeleteInvoiceMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, DeleteInvoiceVariables>({
    getEndpoint: (variables) => `/invoice/${variables.id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
      },
    },
  });
}
