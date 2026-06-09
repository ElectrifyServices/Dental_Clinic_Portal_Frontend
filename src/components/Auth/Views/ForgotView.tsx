import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui";
import { Mail, ArrowRight } from "lucide-react";

interface ForgotViewProps {
  setView: (view: 'login' | 'forgot' | 'forgot-sent') => void;
  resetEmail: string;
  setResetEmail: (email: string) => void;
}

export function ForgotView({ setView, resetEmail, setResetEmail }: ForgotViewProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Forgot Password
        </h1>
        <p className="text-gray-500 text-[14px] mt-2 leading-relaxed">
          Enter your email address and we'll send you a link to reset your password.
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
          <Label className="text-[13px] font-semibold text-gray-600 block mb-1.5">
            Email address
          </Label>
          <div className="relative group">
            <Mail className="w-[15px] h-[15px] text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-500" />
            <Input
              type="email"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="you@clinic.com"
              className="w-full pl-10 pr-4 h-11 border border-gray-200 rounded-xl text-[14px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-150"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-all duration-150 shadow-sm shadow-blue-200 mt-2"
        >
          <span>Send Reset Link</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Button
          variant="ghost"
          type="button"
          onClick={() => setView('login')}
          className="text-[13px] text-blue-600 hover:text-blue-700 hover:bg-transparent font-medium transition-colors p-0 h-auto"
        >
          Back to Login
        </Button>
      </div>
    </div>
  );
}
