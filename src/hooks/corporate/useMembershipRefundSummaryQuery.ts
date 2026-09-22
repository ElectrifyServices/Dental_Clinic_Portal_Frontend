import { useApiQuery } from "../useApiQuery";

export interface MembershipRefundRecord {
  id: string;
  amount: number;
  payment_method: "CASH" | "CARD" | "UPI" | "ONLINE";
  notes?: string | null;
  refunded_at: string;
}

export interface MembershipRefundEnrollmentSummary {
  enrollment_id: string;
  plan_name: string;
  paid_amount: number;
  amount_payable_for_used_period: number;
  refund_due: number;
  refunded_so_far: number;
  refund_remaining: number;
  refunds: MembershipRefundRecord[];
}

export interface MembershipRefundSummary {
  member_id: string;
  enrollments: MembershipRefundEnrollmentSummary[];
}

export function useMembershipRefundSummaryQuery(memberId: string | null | undefined) {
  return useApiQuery<{ data: MembershipRefundSummary }>({
    queryKey: ["membershipRefundSummary", memberId],
    endpoint: `/member/${memberId}/refund-summary`,
    method: "get",
    options: {
      enabled: !!memberId,
    },
  });
}
