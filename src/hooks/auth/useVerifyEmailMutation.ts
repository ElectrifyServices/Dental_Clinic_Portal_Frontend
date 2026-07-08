import { useApiMutation } from "../useApiMutation";

interface VerifyEmailVariables {
  email: string;
}

interface VerifyEmailResponse {
  data: {
    exists: boolean;
  };
}

export function useVerifyEmailMutation() {
  return useApiMutation<VerifyEmailResponse, VerifyEmailVariables>({
    endpoint: "/auth/verify-email",
    method: "post",
  });
}
