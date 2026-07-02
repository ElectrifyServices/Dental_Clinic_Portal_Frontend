import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui";
import { Mail, ArrowRight } from "lucide-react";
import logoImg from "../../../logo.png";

interface ForgotViewProps {
  setView: (view: 'login' | 'forgot' | 'forgot-sent') => void;
  resetEmail: string;
  setResetEmail: (email: string) => void;
}

export function ForgotView({ setView, resetEmail, setResetEmail }: ForgotViewProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
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

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2"
        >
          <span>Send Reset Link</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
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
    </div>
  );
}
