import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { User } from "../types";
import { useLoginMutation } from "../hooks/auth/useLoginMutation";
import { useLogoutMutation } from "../hooks/auth/useLogoutMutation";
import { AuthStorage } from "../auth/authStorage";
import { toast } from "../components/ui";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

function initAuth(initial: AuthState): AuthState {
  const savedUser = AuthStorage.getUser();
  const token = AuthStorage.getAccessToken();
  if (savedUser && token) {
    if (typeof savedUser.role === 'object' && savedUser.role !== null) {
      savedUser.role = (savedUser.role as any).name.toLowerCase().replace('_', '');
    }
    return { ...initial, user: savedUser, isAuthenticated: true };
  }
  return initial;
}

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
} | null>(null);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isLoading: false,
        user: action.payload,
        isAuthenticated: true,
      };
    case "LOGIN_FAILURE":
      return { ...state, isLoading: false, error: action.payload };
    case "LOGOUT":
      return { ...state, user: null, isAuthenticated: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState, initAuth);

  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();

  const DEMO_EMAIL = 'demo@clinic.com';
  const DEMO_PASSWORD = 'demo';

  const login = async (email: string, password?: string) => {
    dispatch({ type: "LOGIN_START" });

    // ── Demo mode: bypass API entirely ───────────────────────────────────────
    if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const demoUser = {
        id: 'DEMO-001',
        name: 'Demo Admin',
        email: DEMO_EMAIL,
        role: 'admin' as const,
        permissions: ['all'],
        isActive: true,
        avatar: undefined,
      };
      const fakeTokens = { accessToken: 'demo-token', refreshToken: 'demo-refresh', session_id: 'demo-session' };
      AuthStorage.save({ user_info: demoUser, tokens: fakeTokens }, false);
      sessionStorage.setItem('demo_mode', 'true');
      dispatch({ type: "LOGIN_SUCCESS", payload: demoUser });
      toast.success("Welcome! Running in Demo Mode — no backend required.");
      return;
    }
    // ─────────────────────────────────────────────────────────────────────────

    try {
      // useApiMutation returns parsed.data directly (i.e. LoginResponseData)
      const response = await loginMutation.mutateAsync({ email, password });

      // Support wrapping in response.data or flat response
      const apiData = response && "data" in response ? (response as any).data : response;

      const user_info = apiData?.user_info;
      const tokens = apiData?.tokens;
      const sessionId = apiData?.sessionId;

      if (!user_info || !tokens) {
        throw new Error("Invalid response from server");
      }

      // Map role object from API to string format expected by frontend
      const mappedRole = typeof user_info.role === 'object' && user_info.role !== null
        ? user_info.role.name.toLowerCase().replace('_', '')
        : user_info.role;

      const normalizedUserInfo = {
        ...user_info,
        role: mappedRole
      };

      const authData = {
        user_info: normalizedUserInfo,
        tokens: {
          ...tokens,
          session_id: sessionId,
        },
      };

      // Always remembering for now, you can wire this to a checkbox later
      AuthStorage.save(authData, true);

      dispatch({ type: "LOGIN_SUCCESS", payload: normalizedUserInfo });
      toast.success("Welcome back! Logged in successfully.");
    } catch (error: any) {
      // The API returns error messages inside responseStatusList.statusList[0].statusDesc
      const apiStatusDesc =
        error?.response?.data?.responseStatusList?.statusList?.[0]?.statusDesc;

      const errorMessage =
        apiStatusDesc ||
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Try again.";

      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync({});
    } catch (error) {
    } finally {
      AuthStorage.clear();
      sessionStorage.removeItem('demo_mode');
      dispatch({ type: "LOGOUT" });
      toast.success("Logged out successfully.");
    }
  };

  return (
    <AuthContext.Provider value={{ state, dispatch, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
