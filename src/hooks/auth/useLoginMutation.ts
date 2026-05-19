import { useApiMutation } from "../useApiMutation";

interface LoginVariables {
  email: string;
  password?: string;
}

interface LoginResponseData {
  user_info: {
    id: string;
    name: string;
    email: string;
    role: string | { name: string };
    [key: string]: any;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    [key: string]: any;
  };
  sessionId?: string;
}

// ─── API Definition ───────────────────────────────────────────────────────────
const LOGIN_ENDPOINT = "/auth/login";

export function useLoginMutation() {
  return useApiMutation<LoginResponseData, LoginVariables>({
    endpoint: LOGIN_ENDPOINT,
    method: "post",
  });
}
