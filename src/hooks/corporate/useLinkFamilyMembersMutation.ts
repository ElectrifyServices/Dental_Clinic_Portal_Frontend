import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface LinkFamilyMemberItem {
  id: string;
  relationship_type: string;
}

export interface LinkFamilyMembersVariables {
  parent_member_id: string;
  members: LinkFamilyMemberItem[];
}

export interface LinkFamilyMembersResponse {
  id: string;
  name: string;
  family_members?: unknown[];
  [key: string]: unknown;
}

export function useLinkFamilyMembersMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<LinkFamilyMembersResponse, LinkFamilyMembersVariables>({
    endpoint: "/member/link-family",
    method: "patch",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["member"] });
        queryClient.invalidateQueries({ queryKey: ["employees"] });
      },
    },
  });
}

export function useUnlinkFamilyMemberMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<LinkFamilyMembersResponse, { id: string }>({
    getEndpoint: (vars) => `/member/${vars.id}/unlink-family`,
    method: "patch",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["member"] });
        queryClient.invalidateQueries({ queryKey: ["employees"] });
      },
    },
  });
}
