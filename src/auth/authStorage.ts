import type { ApiAny } from "../types/api";
import type { User } from "../types";
import type { ThemeData } from "../contexts/ThemeContext";
import Cookies from "js-cookie";

const THEME_STORAGE_KEY = "dental_theme";

// Flags for the auth cookies. Secure is set only on https, so local http development still works;
// SameSite=Lax stops the cookies from being sent along with requests started by other sites.
// (They are still readable by the app's own JavaScript: the API call uses the Authorization header.)
const authCookieOptions = (): Cookies.CookieAttributes => ({
  path: "/",
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
  sameSite: "lax",
});

interface Tokens {
  accessToken: string;
  // Absent when the server keeps the refresh token in an HttpOnly cookie (see refreshCookieMode.ts)
  refreshToken?: string;
  session_id: string;
}

export interface AuthData {
  user_info: User;
  tokens: Tokens;
}

export const AuthStorage = {
  save: (data: AuthData, remember: boolean) => {
    // Clear any existing auth data first
    AuthStorage.clear();

    const { tokens, user_info } = data;

    if (remember) {
      // Store in cookies (persistent)
      Cookies.set("accessToken", data.tokens.accessToken, authCookieOptions());
      if (tokens.refreshToken) {
        Cookies.set("refreshToken", tokens.refreshToken, authCookieOptions());
      }
      Cookies.set(
        "user",
        JSON.stringify({ ...user_info, session_id: tokens.session_id }),
        authCookieOptions()
      );
    } else {
      // Store in sessionStorage (cleared on tab close)
      sessionStorage.setItem("accessToken", data.tokens.accessToken);
      if (tokens.refreshToken) {
        sessionStorage.setItem("refreshToken", tokens.refreshToken);
      }
      sessionStorage.setItem(
        "user",
        JSON.stringify({ ...user_info, session_id: tokens.session_id })
      );
    }
  },

  saveCurrentUser: (user: ApiAny, remember: boolean) => {
    if (remember) {
      // Store in cookies (persistent)
      Cookies.set("current_user", JSON.stringify(user), authCookieOptions());
    } else {
      // Store in sessionStorage (cleared on tab close)
      sessionStorage.setItem("current_user", JSON.stringify(user));
    }
  },

  getCurrentUser: (): User | null => {
    const userFromCookie = Cookies.get("current_user");
    const userFromSession = sessionStorage.getItem("current_user");

    try {
      if (userFromCookie) return JSON.parse(userFromCookie);
      if (userFromSession) return JSON.parse(userFromSession);
    } catch (_error) { /* stored JSON is corrupt - fall through to the null return below */
    }

    return null;
  },

  getUser: (): (User & { session_id?: string }) | null => {
    const userFromCookie = Cookies.get("user");
    const userFromSession = sessionStorage.getItem("user");

    try {
      if (userFromCookie) return JSON.parse(userFromCookie);
      if (userFromSession) return JSON.parse(userFromSession);
    } catch (_error) {
      AuthStorage.clear(); // Clear corrupt data
    }

    return null;
  },

  clear: () => {
    // Remove cookies
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("refreshToken", { path: "/" });
    Cookies.remove("user", { path: "/" });
    Cookies.remove("current_user", { path: "/" });

    // Clear session storage completely
    try {
      sessionStorage.clear();
    } catch {
      /* ignore */
    }

    // Clear local storage completely (remove any cached clinical, inventory, plan data)
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
  },

  // ── Theme persistence (login API → localStorage) ────────────────────────

  saveTheme: (data: ThemeData): void => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* private browsing */
    }
  },

  getTheme: (): ThemeData | null => {
    try {
      const raw = localStorage.getItem(THEME_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ThemeData;
    } catch {
      /* corrupt data */
    }
    return null;
  },

  clearTheme: (): void => {
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch {
      /* private browsing */
    }
  },

  getAccessToken: (): string | undefined => {
    return (
      Cookies.get("accessToken") ||
      sessionStorage.getItem("accessToken") ||
      undefined
    );
  },

  getRefreshToken: (): string | undefined => {
    return (
      Cookies.get("refreshToken") ||
      sessionStorage.getItem("refreshToken") ||
      undefined
    );
  },

  setAccessToken: (accessToken: string) => {
    Cookies.set("accessToken", accessToken, authCookieOptions());
    sessionStorage.setItem("accessToken", accessToken);
  },

  // Removes the browser-side copy of the refresh token. Used once the server keeps it in its
  // HttpOnly cookie, and for sessions that started before that, so no script can read it.
  clearRefreshToken: () => {
    Cookies.remove("refreshToken", { path: "/" });
    try {
      sessionStorage.removeItem("refreshToken");
    } catch {
      /* ignore */
    }
  },

  setRefreshToken: (refreshToken: string) => {
    Cookies.set("refreshToken", refreshToken, authCookieOptions());
    sessionStorage.setItem("refreshToken", refreshToken);
  },

  setSessionId: (sessionId: string) => {
    const user = AuthStorage.getUser();
    if (user) {
      user.session_id = sessionId;
      AuthStorage.saveCurrentUser(user, true);
    }
  },
};
