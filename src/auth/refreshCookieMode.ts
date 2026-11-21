// Refresh token in an HttpOnly cookie (audit item V2).
//
// When VITE_REFRESH_COOKIE_MODE=on the app asks the server (header x-refresh-mode: cookie) to keep the
// refresh token in an HttpOnly cookie that JavaScript cannot read, and the app no longer stores it anywhere.
// This is now the permanent behaviour (ON by default, no .env value needed).
// Only an explicit VITE_REFRESH_COOKIE_MODE=off turns it off, as an emergency rollback.
export const REFRESH_COOKIE_MODE =
  import.meta.env.VITE_REFRESH_COOKIE_MODE !== "off";

export const refreshModeHeaders = (): Record<string, string> =>
  REFRESH_COOKIE_MODE ? { "x-refresh-mode": "cookie" } : {};
