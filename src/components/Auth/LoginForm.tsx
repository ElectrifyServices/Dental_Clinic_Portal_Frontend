import { useState } from "react";
import { Building2, Shield, Users } from "lucide-react";
import { LoginView } from "./Views/LoginView";
import { ForgotView } from "./Views/ForgotView";
import { ForgotSentView } from "./Views/ForgotSentView";
import logoImg from "../../logo.png";

export function LoginForm() {
  const [view, setView] = useState<'login' | 'forgot' | 'forgot-sent'>('login');
  const [resetEmail, setResetEmail] = useState('');

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* ── Left Panel ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0a1128] via-[#0f1e3c] to-[#162a5b]">
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Dynamic accent blobs */}
        <div className="absolute -bottom-32 -left-32 w-[450px] h-[450px] rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -right-24 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Top — Logo + headline */}
        <div className="relative p-12 pt-14">
          <div className="flex items-center gap-3.5 mb-14">
            <div className="w-10 h-10 rounded-xl bg-white border border-white/10 flex items-center justify-center overflow-hidden p-1 shadow-lg shadow-blue-500/5">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <span className="text-white font-extrabold text-[16px] tracking-tight">
              Opal Smiles Dental Studio
            </span>
          </div>

          <p className="text-blue-400/80 text-xs uppercase tracking-[0.2em] font-bold mb-3">
            Back-Office Portal
          </p>
          <h2 className="text-[2.6rem] font-black text-white leading-[1.15] tracking-tight mb-5">
            Streamlined
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">Clinic</span> Operations
          </h2>
          <p className="text-slate-400 text-[15px] leading-relaxed max-w-xs mb-8">
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
            <div key={i} className="flex items-center gap-4 group/item cursor-default">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 flex-shrink-0 transition-all group-hover/item:bg-white/10 group-hover/item:border-white/20">
                {f.icon}
              </div>
              <div>
                <p className="text-slate-200 text-sm font-medium">{f.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{f.sub}</p>
              </div>
            </div>
          ))}

          <p className="text-slate-600 text-xs pt-4">
            © 2025 Opal Smiles Dental Studio · All rights reserved
          </p>
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-[#F8FAFC]">
        <div className="card w-full max-w-[440px] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {view === 'login' && <LoginView setView={setView} />}
          {view === 'forgot' && <ForgotView setView={setView} resetEmail={resetEmail} setResetEmail={setResetEmail} />}
          {view === 'forgot-sent' && <ForgotSentView setView={setView} resetEmail={resetEmail} setResetEmail={setResetEmail} />}
        </div>
      </div>
    </div>
  );
}
