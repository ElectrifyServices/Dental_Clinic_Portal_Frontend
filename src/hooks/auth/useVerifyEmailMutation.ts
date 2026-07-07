import { useApiMutation } from "../useApiMutation";

interface VerifyEmailVariables {
  email: string;
}

interface VerifyEmailResponse {
  data: {
    exists: boolean;
  };
}

// ─── API Definition ───────────────────────────────────────────────────────────
const VERIFY_EMAIL_ENDPOINT = "/auth/verify-email";

export function useVerifyEmailMutation() {
  return useApiMutation<VerifyEmailResponse, VerifyEmailVariables>({
    endpoint: VERIFY_EMAIL_ENDPOINT,
    method: "post",
  });
}
