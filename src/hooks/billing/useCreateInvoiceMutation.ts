import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CreateInvoiceItemVariables {
  item_type: "CONSULTATION" | "TREATMENT_SESSION" | "MEMBERSHIP";
  consultation_id?: string;
  treatment_plan_id?: string;
  membership_id?: string;
  description?: string;
  billing_description_id?: string;
  total_amount: number;
  billed_amount: number;
}

export interface CreateInvoiceVariables {
  patient_id?: string;
  member_id?: string;
  due_date: string;
  payment_method: string;
  complimentary_reason?: string;
  discount: number;
  tax_percentage: number;
  items: CreateInvoiceItemVariables[];
  plan_id?: string;
}

export function useCreateInvoiceMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, CreateInvoiceVariables>({
    endpoint: "/invoice",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        queryClient.invalidateQueries({ queryKey: ["unbilledItems"] });
      },
    },
  });
}
