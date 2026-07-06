import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui";
import { Mail, ArrowRight, Lock, Key, ArrowLeft } from "lucide-react";
import logoImg from "../../../logo.png";
import { useState } from "react";

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

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      import("react-hot-toast").then((module) => {
        module.default.error("Passwords do not match");
      });
      return;
    }
    import("react-hot-toast").then((module) => {
      module.default.success("Password updated successfully!");
    });
    setShowChangeModal(false);
    setView('login');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
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
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter old password"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-[13px] font-bold text-slate-700 block mb-1.5">New Password</Label>
              <div className="relative group">
                <Lock className="w-[15px] h-[15px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600" />
                <Input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-[13px] font-bold text-slate-700 block mb-1.5">Confirm Password</Label>
              <div className="relative group">
                <Lock className="w-[15px] h-[15px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600" />
                <Input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full mt-4">
              Update Password
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full mt-2"
              onClick={() => setShowChangeModal(false)}
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
            onSubmit={(e) => {
              e.preventDefault();
              if (resetEmail) setView('forgot-sent');
            }}
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
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@clinic.com"
                  className="pl-10"
                />
              </div>
            </div>

            {!isVerified ? (
              <Button
                type="button"
                size="lg"
                className="w-full mt-2"
                onClick={() => {
                  if (resetEmail) setIsVerified(true);
                }}
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
