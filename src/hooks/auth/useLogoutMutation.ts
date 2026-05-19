import { useApiMutation } from "../useApiMutation";

// ─── API Definition ───────────────────────────────────────────────────────────
const LOGOUT_ENDPOINT = "/auth/logout";

export function useLogoutMutation() {
  return useApiMutation<void, Record<string, never>>({
    endpoint: LOGOUT_ENDPOINT,
    method: "put",
  });
}
