import { useState } from "react";
import { Stethoscope, Building2, Shield, Users } from "lucide-react";
import { LoginView } from "./Views/LoginView";
import { ForgotView } from "./Views/ForgotView";
import { ForgotSentView } from "./Views/ForgotSentView";

export function LoginForm() {
  const [view, setView] = useState<'login' | 'forgot' | 'forgot-sent'>('login');
  const [resetEmail, setResetEmail] = useState('');

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* ── Left Panel ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between overflow-hidden bg-[#0f1e3c]">
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Accent circle */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Top — Logo + headline */}
        <div className="relative p-12 pt-14">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <Stethoscope className="w-[18px] h-[18px] text-blue-300" />
            </div>
            <span className="text-white font-semibold text-[15px] tracking-tight">
              DentalCare Pro
            </span>
          </div>

          <p className="text-blue-400/70 text-xs uppercase tracking-[0.15em] font-medium mb-3">
            Back-Office Portal
          </p>
          <h2 className="text-[2.6rem] font-bold text-white leading-[1.15] tracking-tight mb-5">
            Streamlined
            <br />
            <span className="text-blue-400">Clinic</span> Operations
          </h2>
          <p className="text-slate-400 text-[15px] leading-relaxed max-w-xs">
           Complete dental clinic operations — appointments, patient records,
            billing, and corporate plans — unified in one portal.
          </p>
        </div>

        {/* Bottom — Feature list */}
        <div className="relative p-12 pb-14 space-y-4">
          {[
            {
              icon: <Building2 className="w-4 h-4" />,
              label: "Corporate Plan Management",
              sub: "Multi-clinic support",
            },
            {
              icon: <Shield className="w-4 h-4" />,
              label: "Role-Based Access Control",
              sub: "Granular permissions",
            },
            {
              icon: <Users className="w-4 h-4" />,
              label: "Complete Patient Lifecycle",
              sub: "From intake to billing",
            },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <p className="text-slate-200 text-sm font-medium">{f.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{f.sub}</p>
              </div>
            </div>
          ))}

          <p className="text-slate-600 text-xs pt-4">
            © 2025 DentalCare Pro · All rights reserved
          </p>
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-white">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10 justify-center">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
              <Stethoscope className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              DentalCare Pro
            </span>
          </div>

          {view === 'login' && <LoginView setView={setView} />}
          {view === 'forgot' && <ForgotView setView={setView} resetEmail={resetEmail} setResetEmail={setResetEmail} />}
          {view === 'forgot-sent' && <ForgotSentView setView={setView} resetEmail={resetEmail} setResetEmail={setResetEmail} />}
        </div>
      </div>
    </div>
  );
}
