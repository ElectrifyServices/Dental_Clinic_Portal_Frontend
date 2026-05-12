import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { User } from "../types";

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

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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

const DEMO_USERS: Record<string, { user: User; password: string }> = {
  "superadmin@clinic.com": {
    password: "admin123",
    user: {
      id: "SA-1",
      name: "Super Admin",
      email: "superadmin@clinic.com",
      role: "superadmin",
      permissions: ["all", "corporate_plans"],
      isActive: true,
    },
  },
  "admin@clinic.com": {
    password: "admin123",
    user: {
      id: "AD-1",
      name: "Dr. Rajesh Sharma",
      email: "admin@clinic.com",
      role: "admin",
      permissions: ["all"],
      isActive: true,
      specialization: "General Dentistry",
      avatar:
        "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  },
  "doctor@clinic.com": {
    password: "doctor123",
    user: {
      id: "DR-1",
      name: "Dr. Priya Patel",
      email: "doctor@clinic.com",
      role: "doctor",
      permissions: ["appointments", "patients", "treatments", "emr"],
      isActive: true,
      specialization: "Orthodontics",
      avatar:
        "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  },
  "receptionist@clinic.com": {
    password: "recep123",
    user: {
      id: "RC-1",
      name: "Meena Kumari",
      email: "receptionist@clinic.com",
      role: "receptionist",
      permissions: ["appointments", "patients", "billing", "consent"],
      isActive: true,
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email: string) => {
    dispatch({ type: "LOGIN_START" });
    try {
      await new Promise((r) => setTimeout(r, 700));
      const entry = DEMO_USERS[email.toLowerCase()];
      if (!entry) {
        dispatch({
          type: "LOGIN_FAILURE",
          payload: "Invalid email or password",
        });
        return;
      }
      localStorage.setItem("user", JSON.stringify(entry.user));
      dispatch({ type: "LOGIN_SUCCESS", payload: entry.user });
    } catch {
      dispatch({ type: "LOGIN_FAILURE", payload: "Login failed. Try again." });
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        dispatch({ type: "LOGIN_SUCCESS", payload: JSON.parse(saved) });
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

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
