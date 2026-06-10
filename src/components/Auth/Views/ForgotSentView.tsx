import { Button } from "@/components/ui";
import { Mail } from "lucide-react";

interface ForgotSentViewProps {
  setView: (view: 'login' | 'forgot' | 'forgot-sent') => void;
  resetEmail: string;
  setResetEmail: (email: string) => void;
}

export function ForgotSentView({ setView, resetEmail, setResetEmail }: ForgotSentViewProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 text-center">
      <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Mail className="w-8 h-8 text-blue-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">
        Check Your Email
      </h1>
      <p className="text-gray-600 text-[14px] leading-relaxed mb-6">
        We've sent a password reset link to:<br/>
        <span className="font-semibold text-gray-900">{resetEmail}</span>
      </p>
      
      <div className="bg-gray-50 rounded-xl p-4 text-left border border-gray-100 mb-8">
        <p className="text-gray-500 text-[13px] mb-2 flex items-start gap-2">
          <span className="text-blue-500 font-bold mt-0.5">•</span>
          <span>Please check your email and click the link to reset your password.</span>
        </p>
        <p className="text-gray-500 text-[13px] flex items-start gap-2">
          <span className="text-blue-500 font-bold mt-0.5">•</span>
          <span>If you don't see the email, please check your spam folder.</span>
        </p>
      </div>

      <Button
        variant="outline"
        type="button"
        onClick={() => { setView('login'); setResetEmail(''); }}
        className="w-full h-11 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 rounded-xl font-semibold text-[14px] transition-all duration-150"
      >
        Back to Login
      </Button>
    </div>
  );
}
