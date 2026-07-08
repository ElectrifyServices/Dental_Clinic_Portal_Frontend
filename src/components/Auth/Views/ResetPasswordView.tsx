import { useState, useEffect } from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button, Loading, toast } from "@/components/ui";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react";
import logoImg from "../../../logo.png";
import { useResetPasswordMutation } from "@/hooks/auth/useResetPasswordMutation";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

export function ResetPasswordView() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutateAsync: resetPassword } = useResetPasswordMutation();

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get("token") || new URLSearchParams(location.search).get("token") || "";

  const [token, setToken] = useState(urlToken);
  const [manualTokenInput, setManualTokenInput] = useState("");

  useEffect(() => {
    if (!token) {
      setTokenError("Invalid or missing reset token.");
    } else {
      setTokenError(""); // Clear error if token is present
    }
  }, [token]);

  // Password Validation Logic
  const criteria = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
  };

  const isPasswordSecure = Object.values(criteria).every(Boolean);
  const showMismatchError = confirmPassword !== "" && newPassword !== confirmPassword;
  const passwordsMatch = newPassword === confirmPassword;
  const isFormValid = isPasswordSecure && passwordsMatch && token;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);
    setFormError("");
    try {
      await resetPassword({
        token,
        newPassword,
        confirmPassword
      });
      toast.success("Password has been reset successfully!");
      setIsSuccess(true);
    } catch (error: any) {
      const msg = error.message || "Failed to reset password";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenError && !token) {
    return (
      <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-300 text-center">
        <div className="w-20 h-20 mx-auto flex items-center justify-center mb-4">
          <img src={logoImg} alt="Logo" className="w-full h-full object-contain grayscale opacity-50" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Token Missing
        </h1>
        <p className="text-slate-500 text-sm mb-4 font-medium">
          The link you clicked didn't contain a reset token. If your email contains the token separately, you can paste it below.
        </p>
        <div className="mb-4">
          <Input 
            type="text" 
            placeholder="Paste your reset token here" 
            value={manualTokenInput}
            onChange={(e) => setManualTokenInput(e.target.value)}
            className="text-center"
          />
        </div>
        <Button 
          onClick={() => {
            if (manualTokenInput.trim()) {
              setToken(manualTokenInput.trim());
            }
          }} 
          className="w-full mb-2"
          disabled={!manualTokenInput.trim()}
        >
          Verify Token
        </Button>
        <Button variant="ghost" onClick={() => navigate("/login")} className="w-full">
          Back to Login
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-300 text-center">
        <div className="w-20 h-20 mx-auto flex items-center justify-center mb-4 text-emerald-500">
          <Check className="w-16 h-16 stroke-[3]" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Password Reset Complete
        </h1>
        <p className="text-slate-500 text-sm mb-8 font-medium">
          Your password has been successfully updated. You can now login with your new password.
        </p>
        <Button onClick={() => navigate("/login")} className="w-full" size="lg">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-300">
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-xl z-50 flex items-center justify-center animate-in fade-in duration-200">
          <Loading type="spinner" className="py-0" />
        </div>
      )}

      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-20 h-20 flex items-center justify-center mb-4 transition-transform duration-500 hover:scale-105 hover:rotate-3">
          <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Set New Password
        </h1>
        <p className="text-slate-500 text-sm mt-1.5 leading-relaxed max-w-[280px]">
          Create a new password for your account.
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-4 p-2">
        <div>
          <Label className="text-[13px] font-bold text-slate-700 block mb-1.5">New Password</Label>
          <div className="relative group">
            <Lock className="w-[15px] h-[15px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600" />
            <Input
              type={showNewPassword ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="pl-10 pr-11"
            />
            <Button
              variant="ghost"
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 hover:bg-transparent transition-colors p-0.5 h-auto"
              aria-label={showNewPassword ? "Hide password" : "Show password"}
            >
              {showNewPassword ? (
                <EyeOff className="w-[15px] h-[15px]" />
              ) : (
                <Eye className="w-[15px] h-[15px]" />
              )}
            </Button>
          </div>

          {newPassword && (
            <div className="mt-2.5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs animate-in fade-in duration-200">
              <p className="font-bold text-slate-700 mb-1">Password must contain:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className={`flex items-center gap-1.5 font-medium transition-colors ${criteria.length ? "text-emerald-600 font-semibold" : "text-rose-500 font-semibold"}`}>
                  {criteria.length ? (
                    <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-rose-500" />
                  )}
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium transition-colors ${criteria.uppercase ? "text-emerald-600 font-semibold" : "text-rose-500 font-semibold"}`}>
                  {criteria.uppercase ? (
                    <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-rose-500" />
                  )}
                  <span>1 uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium transition-colors ${criteria.lowercase ? "text-emerald-600 font-semibold" : "text-rose-500 font-semibold"}`}>
                  {criteria.lowercase ? (
                    <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-rose-500" />
                  )}
                  <span>1 lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium transition-colors ${criteria.number ? "text-emerald-600 font-semibold" : "text-rose-500 font-semibold"}`}>
                  {criteria.number ? (
                    <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-rose-500" />
                  )}
                  <span>1 number (0-9)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <Label className="text-[13px] font-bold text-slate-700 block mb-1.5">Confirm New Password</Label>
          <div className="relative group">
            <Lock className="w-[15px] h-[15px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="pl-10 pr-11"
            />
            <Button
              variant="ghost"
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 hover:bg-transparent transition-colors p-0.5 h-auto"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-[15px] h-[15px]" />
              ) : (
                <Eye className="w-[15px] h-[15px]" />
              )}
            </Button>
          </div>

          {showMismatchError && (
            <p className="text-xs text-rose-500 font-medium mt-1 animate-in fade-in slide-in-from-top-1">
              Passwords do not match
            </p>
          )}
          {confirmPassword && passwordsMatch && (
            <p className="text-xs text-emerald-600 font-medium mt-1 animate-in fade-in slide-in-from-top-1 flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3] text-emerald-600" /> Passwords match
            </p>
          )}
        </div>

        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl animate-in fade-in slide-in-from-top-2">
            <p className="text-xs text-rose-600 font-bold text-center">
              {formError}
            </p>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full mt-4"
          disabled={!isFormValid || isLoading}
          loading={isLoading}
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
}
