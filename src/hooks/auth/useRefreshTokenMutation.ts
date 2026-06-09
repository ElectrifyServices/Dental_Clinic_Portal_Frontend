import { useApiMutation } from "../useApiMutation";

interface RefreshTokenVariables {
  refreshToken: string;
}

interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
  session_id?: string;
}

const REFRESH_TOKEN_ENDPOINT = "/auth/refresh-token";

export function useRefreshTokenMutation() {
  return useApiMutation<RefreshTokenResponseData, RefreshTokenVariables>({
    endpoint: REFRESH_TOKEN_ENDPOINT,
    method: "post",
    headers: (variables: RefreshTokenVariables) => ({
      "x-refresh-token": variables.refreshToken,
    }),
    transformRequest: () => null, // Empty request body, as token is sent via header
  });
}
