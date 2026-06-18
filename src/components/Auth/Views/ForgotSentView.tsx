import { Button } from "@/components/ui";
import { MailCheck } from "lucide-react";
import logoImg from "../../../logo.png";

interface ForgotSentViewProps {
  setView: (view: 'login' | 'forgot' | 'forgot-sent') => void;
  resetEmail: string;
  setResetEmail: (email: string) => void;
}

export function ForgotSentView({ setView, resetEmail, setResetEmail }: ForgotSentViewProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 text-center">
      {/* Header with Logo */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-2 shadow-xl shadow-slate-100/50 mb-4 transition-transform duration-500 hover:scale-105 hover:rotate-3 overflow-hidden">
          <img src={logoImg} alt="Logo" className="w-full h-full object-contain rounded-xl" />
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
          <MailCheck className="w-6 h-6 text-blue-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Check your email
        </h1>
        <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
          We've sent a password reset link to:<br/>
          <span className="font-bold text-slate-800">{resetEmail}</span>
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left mb-6">
        <p className="text-slate-600 text-[13px] mb-2 flex items-start gap-2">
          <span className="text-blue-500 font-black mt-0.5">•</span>
          <span>Click the link in the email to choose a new password.</span>
        </p>
        <p className="text-slate-600 text-[13px] flex items-start gap-2">
          <span className="text-blue-500 font-black mt-0.5">•</span>
          <span>Don't see it? Check your spam or promotions folder.</span>
        </p>
      </div>

      <Button
        variant="outline"
        size="lg"
        type="button"
        onClick={() => { setView('login'); setResetEmail(''); }}
        className="w-full"
      >
        Back to login
      </Button>
    </div>
  );
}