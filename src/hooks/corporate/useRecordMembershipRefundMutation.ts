import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { MembershipRefundRecord } from "./useMembershipRefundSummaryQuery";

export interface RecordMembershipRefundVariables {
  memberId: string;
  enrollment_id: string;
  amount: number;
  payment_method: "CASH" | "CARD" | "UPI" | "ONLINE";
  notes?: string;
}

export function useRecordMembershipRefundMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<{ data: MembershipRefundRecord }, RecordMembershipRefundVariables>({
    getEndpoint: (variables) => `/member/${variables.memberId}/refunds`,
    method: "post",
    transformRequest: (variables) => ({
      enrollment_id: variables.enrollment_id,
      amount: variables.amount,
      payment_method: variables.payment_method,
      notes: variables.notes,
    }),
    options: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["membershipRefundSummary", variables.memberId] });
      },
    },
  });
}
