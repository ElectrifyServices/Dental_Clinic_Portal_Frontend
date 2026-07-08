import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button, Loading, toast } from "@/components/ui";
import { Mail, ArrowRight, Lock, Key, ArrowLeft, Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import logoImg from "../../../logo.png";
import { useState } from "react";
import { useVerifyEmailMutation } from "@/hooks/auth/useVerifyEmailMutation";
import { useForgotPasswordMutation } from "@/hooks/auth/useForgotPasswordMutation";
import { useChangePasswordMutation } from "@/hooks/auth/useChangePasswordMutation";

interface ForgotViewProps {
  setView: (view: 'login' | 'forgot' | 'forgot-sent') => void;
  resetEmail: string;
  setResetEmail: (email: string) => void;
}

export function ForgotView({ setView, resetEmail, setResetEmail }: ForgotViewProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading and Validation States
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutateAsync: verifyEmail } = useVerifyEmailMutation();
  const { mutateAsync: forgotPassword } = useForgotPasswordMutation();
  const { mutateAsync: changePassword } = useChangePasswordMutation();

  // Email Validation Logic
  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("Email address is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setResetEmail(val);
    if (emailError) {
      validateEmail(val);
    }
  };

  const handleVerifyEmail = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!validateEmail(resetEmail)) return;
    setEmailError("");
    setIsLoading(true);
    try {
      await verifyEmail({ email: resetEmail });
      setIsVerified(true);
      toast.success("Email verified successfully!");
    } catch (error: any) {
      const msg = error.message || "Failed to verify email. Backend might be down.";
      setEmailError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(resetEmail)) return;
    setEmailError("");
    setIsLoading(true);
    try {
      await forgotPassword({ email: resetEmail });
      toast.success("Password reset link sent to your email!");
      setView('forgot-sent');
    } catch (error: any) {
      const msg = error.message || "Failed to send reset link";
      setEmailError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

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
  const isFormValid = oldPassword.length > 0 && isPasswordSecure && passwordsMatch;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);
    try {
      await changePassword({
        email: resetEmail,
        oldPassword,
        newPassword,
        confirmPassword
      });
      toast.success("Password updated successfully!");
      setShowChangeModal(false);
      setView('login');
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Sleek semi-transparent glassmorphism overlay for unified form loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-xl z-50 flex items-center justify-center animate-in fade-in duration-200">
          <Loading type="spinner" className="py-0" />
        </div>
      )}

      {showChangeModal ? (
        <>
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 flex items-center justify-center mb-4 transition-transform duration-500 hover:scale-105 hover:rotate-3">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Change Password
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed max-w-[280px]">
              Update your account password securely.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 p-2">
            <div>
              <Label className="text-[13px] font-bold text-slate-700 block mb-1.5">Old Password</Label>
              <div className="relative group">
                <Lock className="w-[15px] h-[15px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600" />
                <Input
                  type={showOldPassword ? "text" : "password"}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter old password"
                  className="pl-10 pr-11"
                />
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 hover:bg-transparent transition-colors p-0.5 h-auto"
                  aria-label={showOldPassword ? "Hide password" : "Show password"}
                >
                  {showOldPassword ? (
                    <EyeOff className="w-[15px] h-[15px]" />
                  ) : (
                    <Eye className="w-[15px] h-[15px]" />
                  )}
                </Button>
              </div>
            </div>

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

              {/* Password strength checklist UI */}
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

              {/* Confirm password matches indicator */}
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

            <Button
              type="submit"
              size="lg"
              className="w-full mt-4"
              disabled={!isFormValid || isLoading}
              loading={isLoading}
            >
              Update Password
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full mt-2"
              onClick={() => setShowChangeModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </form>
        </>
      ) : (
        <>
          {/* Header with Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-28 h-28 flex items-center justify-center mb-4 transition-transform duration-500 hover:scale-105 hover:rotate-3">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Forgot Password
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed max-w-[280px]">
              Enter your email address to receive a password reset link.
            </p>
          </div>

          <form
            onSubmit={!isVerified ? handleVerifyEmail : handleSendResetLink}
            className="space-y-4"
          >
            <div>
              <Label className="text-[13px] font-bold text-slate-700 block mb-1.5">
                Email address
              </Label>
              <div className="relative group">
                <Mail className="w-[15px] h-[15px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600" />
                <Input
                  type="email"
                  required
                  disabled={isVerified}
                  value={resetEmail}
                  onChange={handleEmailChange}
                  placeholder="you@clinic.com"
                  className="pl-10"
                />
              </div>
              {emailError && (
                <p className="text-xs text-rose-500 font-medium mt-1 animate-in fade-in slide-in-from-top-1">
                  {emailError}
                </p>
              )}
            </div>

            {!isVerified ? (
              <Button
                type="button"
                size="lg"
                className="w-full mt-2"
                onClick={handleVerifyEmail}
                loading={isLoading}
              >
                <span>Verify</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex flex-col gap-3 mt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  loading={isLoading}
                >
                  <span>Send Reset Link</span>
                  <Mail className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowChangeModal(true)}
                  disabled={isLoading}
                >
                  <span>Change Password</span>
                  <Key className="w-4 h-4" />
                </Button>
              </div>
            )}
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-5">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setView('login')}
              disabled={isLoading}
              className="text-[13px] text-blue-600 hover:text-blue-700 hover:bg-transparent font-bold transition-colors p-0 h-auto"
            >
              Back to Login
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
