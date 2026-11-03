import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button, Loading } from "@/components/ui";
import { Check, X } from "lucide-react";
import { useActivateAccountMutation } from "@/hooks/auth/useActivateAccountMutation";

export function ActivateAccountView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || new URLSearchParams(location.search).get("token") || "";

  const { mutateAsync: activateAccount } = useActivateAccountMutation();
  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [errorMessage, setErrorMessage] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    if (!token || hasRun.current) {
      if (!token) setErrorMessage("The link you clicked didn't contain an activation token.");
      return;
    }
    hasRun.current = true;

    activateAccount({ token })
      .then(() => setStatus("success"))
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : undefined;
        setErrorMessage(message || "This activation link is invalid or has expired.");
        setStatus("error");
      });
  }, [token, activateAccount]);

  if (status === "loading") {
    return (
      <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-300 text-center py-8">
        <Loading type="spinner" className="py-0 mb-4" />
        <h1 className="text-xl font-black text-slate-900 tracking-tight mb-1.5">
          Activating Your Account
        </h1>
        <p className="text-slate-500 text-sm font-medium">Please wait a moment...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-300 text-center">
        <div className="w-20 h-20 mx-auto flex items-center justify-center mb-4 text-emerald-500">
          <Check className="w-16 h-16 stroke-[3]" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Account Activated
        </h1>
        <p className="text-slate-500 text-sm mb-8 font-medium">
          Your account is now active. You can log in using the credentials set for you.
        </p>
        <Button onClick={() => navigate("/login")} className="w-full" size="lg">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-300 text-center">
      <div className="w-20 h-20 mx-auto flex items-center justify-center mb-4 text-rose-500">
        <X className="w-16 h-16 stroke-[3]" />
      </div>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
        Activation Failed
      </h1>
      <p className="text-slate-500 text-sm mb-8 font-medium">{errorMessage}</p>
      <Button onClick={() => navigate("/login")} className="w-full" size="lg">
        Back to Login
      </Button>
    </div>
  );
}
