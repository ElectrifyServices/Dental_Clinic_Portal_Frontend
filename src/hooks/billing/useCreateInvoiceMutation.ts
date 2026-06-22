import { useApiMutation } from "../useApiMutation";

export interface CreateInvoiceItemVariables {
  item_type: "CONSULTATION" | "TREATMENT_SESSION" | "CUSTOM";
  consultation_id?: string;
  treatment_session_id?: string;
  description: string;
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
}

export function useCreateInvoiceMutation() {
  return useApiMutation<any, CreateInvoiceVariables>({
    endpoint: "/invoice",
    method: "post",
  });
}
