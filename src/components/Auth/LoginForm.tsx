import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Building2, Shield, Users } from "lucide-react";
import { LoginView } from "./Views/LoginView";
import { ForgotView } from "./Views/ForgotView";
import { ForgotSentView } from "./Views/ForgotSentView";
import { ResetPasswordView } from "./Views/ResetPasswordView";
const logoImg = "/Portal_logo.png";

export function LoginForm() {
  const location = useLocation();
  const isResetPath = location.pathname.toLowerCase().includes('reset-password');
  const [view, setView] = useState<'login' | 'forgot' | 'forgot-sent' | 'reset'>(isResetPath ? 'reset' : 'login');
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    if (location.pathname.toLowerCase().includes('reset-password')) {
      setView('reset');
    } else if (location.pathname.toLowerCase() === '/login' || location.pathname === '/') {
      setView('login');
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-[#090d16] font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* ── Left Panel ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0c1427] via-[#1a1033] to-[#2d0918] border-r border-slate-800/60">
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Dynamic accent blobs matching logo colors (Blue, Indigo, Crimson Red) */}
        <div className="absolute -top-20 -left-20 w-[450px] h-[450px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[380px] h-[380px] rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-[480px] h-[480px] rounded-full bg-rose-600/20 blur-[130px] pointer-events-none" />

        {/* Top — Logo + headline */}
        <div className="relative p-12 pt-14">
          <div className="flex items-center gap-4 mb-14">
            <div className="w-16 h-16 bg-white/95 rounded-2xl flex items-center justify-center p-2.5 shadow-2xl shadow-blue-950/50 border border-white/20">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-white font-black text-[18px] tracking-tight">
              Electrify Services LLP.
            </span>
          </div>

          <p className="text-blue-400/90 text-xs uppercase tracking-[0.25em] font-bold mb-3">
            Back-Office Portal
          </p>
          <h2 className="text-[2.6rem] font-black text-white leading-[1.15] tracking-tight mb-5">
            Streamlined
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-rose-400 bg-clip-text text-transparent">
              Clinic & Enterprise
            </span> Operations
          </h2>
          <p className="text-slate-300/90 text-[15px] leading-relaxed max-w-sm mb-8 font-medium">
            Complete Electrify Services LLP. operations — appointments, patient records,
            billing, and Membership plans — unified in one portal.
          </p>
        </div>

        {/* Bottom — Feature list */}
        <div className="relative p-12 pb-14 space-y-4">
          {[
            {
              icon: <Building2 className="w-4 h-4 text-blue-400" />,
              label: "Membership Plan Management",
              sub: "Multi-clinic support",
            },
            {
              icon: <Shield className="w-4 h-4 text-indigo-400" />,
              label: "Role-Based Access Control",
              sub: "Granular permissions",
            },
            {
              icon: <Users className="w-4 h-4 text-rose-400" />,
              label: "Complete Patient Lifecycle",
              sub: "From intake to billing",
            },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-4 group/item cursor-default">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 flex-shrink-0 transition-all group-hover/item:bg-white/10 group-hover/item:border-white/20 shadow-sm">
                {f.icon}
              </div>
              <div>
                <p className="text-slate-200 text-sm font-semibold">{f.label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{f.sub}</p>
              </div>
            </div>
          ))}

          <p className="text-slate-400 text-xs pt-6 border-t border-slate-800/80 font-medium">
            © 2026 Electrify Services LLP. · All rights reserved
          </p>
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-[#F8FAFC]">
        <div className="w-full max-w-[440px] p-8 lg:p-10 bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
          {view === 'login' && <LoginView setView={setView} />}
          {view === 'forgot' && <ForgotView setView={setView} resetEmail={resetEmail} setResetEmail={setResetEmail} />}
          {view === 'forgot-sent' && <ForgotSentView setView={setView} resetEmail={resetEmail} setResetEmail={setResetEmail} />}
          {view === 'reset' && <ResetPasswordView />}
        </div>
      </div>
    </div>
  );
}
