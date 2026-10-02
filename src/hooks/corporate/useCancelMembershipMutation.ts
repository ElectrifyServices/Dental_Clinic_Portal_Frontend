import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CancelMembershipVariables {
  id: string;
  reason?: string;
  cascade_to_family?: boolean;
}

export interface CancelMembershipResult {
  id: string;
  message: string;
  cancelled_family_members: number;
  total_refund_estimate: number;
}

/** useApiMutation resolves to the raw `responseObject`, so the actual payload is one level deeper, at `.data`. */
export interface CancelMembershipResponse {
  data: CancelMembershipResult;
}

export function useCancelMembershipMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<CancelMembershipResponse, CancelMembershipVariables>({
    getEndpoint: (variables) => `/member/${variables.id}/cancel-membership`,
    method: "patch",
    transformRequest: (variables) => ({
      reason: variables.reason,
      cascade_to_family: variables.cascade_to_family,
    }),
    options: {
      onSuccess: () => {
        // useEmployeesQuery's actual key is ["member", variables] — invalidate the
        // singular prefix so every filtered/paginated variant refetches.
        queryClient.invalidateQueries({ queryKey: ["member"] });
        queryClient.invalidateQueries({ queryKey: ["membershipStats"] });
      },
    },
  });
}
