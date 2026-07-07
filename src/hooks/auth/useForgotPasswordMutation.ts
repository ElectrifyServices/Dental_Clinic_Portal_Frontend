import { useApiMutation } from "../useApiMutation";

export interface ForgotPasswordVariables {
  email: string;
}

export interface ForgotPasswordResponse {
  data: null;
}

const FORGOT_PASSWORD_ENDPOINT = "/auth/forgot-password";

export function useForgotPasswordMutation() {
  return useApiMutation<ForgotPasswordResponse, ForgotPasswordVariables>({
    endpoint: FORGOT_PASSWORD_ENDPOINT,
    method: "post",
  });
}
