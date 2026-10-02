import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

interface PaySalaryPayload {
  staff_id: string;
  payment_amount: number;
  payment_date: string;
  payment_mode: string;
  disbursement_note: string;
}

export function usePaySalaryMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<ApiAny, PaySalaryPayload>({
    endpoint: "/staffPaymentHistory",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["staff"] });
        queryClient.invalidateQueries({ queryKey: ["salaryHistory"] });
      },
    },
  });
}
