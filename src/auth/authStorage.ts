import type { User } from "../types";
import Cookies from "js-cookie";

interface Tokens {
  accessToken: string;
  refreshToken: string;
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
      Cookies.set("accessToken", data.tokens.accessToken, { path: "/" });
      Cookies.set("refreshToken", data.tokens.refreshToken, { path: "/" });
      Cookies.set(
        "user",
        JSON.stringify({ ...user_info, session_id: tokens.session_id }),
        { path: "/" }
      );
    } else {
      // Store in sessionStorage (cleared on tab close)
      sessionStorage.setItem("accessToken", data.tokens.accessToken);
      sessionStorage.setItem("refreshToken", data.tokens.refreshToken);
      sessionStorage.setItem(
        "user",
        JSON.stringify({ ...user_info, session_id: tokens.session_id })
      );
    }
  },

  saveCurrentUser: (user: any, remember: boolean) => {
    if (remember) {
      // Store in cookies (persistent)
      Cookies.set("current_user", JSON.stringify(user), { path: "/" });
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
    } catch (error) {
      console.warn("Failed to parse user info:", error);
    }

    return null;
  },

  getUser: (): (User & { session_id?: string }) | null => {
    const userFromCookie = Cookies.get("user");
    const userFromSession = sessionStorage.getItem("user");

    try {
      if (userFromCookie) return JSON.parse(userFromCookie);
      if (userFromSession) return JSON.parse(userFromSession);
    } catch (error) {
      console.warn("Failed to parse user info:", error);
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

    // Clear session storage
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("current_user");
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
    Cookies.set("accessToken", accessToken, { path: "/" });
    sessionStorage.setItem("accessToken", accessToken);
  },

  setRefreshToken: (refreshToken: string) => {
    Cookies.set("refreshToken", refreshToken, { path: "/" });
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
