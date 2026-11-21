import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface PayInvoiceVariables {
  id: string;
  payment_method: string;
  amount: number;
}

export function usePayInvoiceMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, PayInvoiceVariables>({
    getEndpoint: (variables) => `/invoice/mark-paid/${variables.id}`,
    method: "patch",
    transformRequest: (variables) => ({
      payment_method: variables.payment_method,
      amount: variables.amount,
    }),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        queryClient.invalidateQueries({ queryKey: ["invoice"] });
      },
    },
  });
}
