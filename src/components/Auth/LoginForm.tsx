import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { state, login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const demoCredentials = [
    { email: 'admin@clinic.com', password: 'admin123', role: 'Admin / Doctor', initials: 'AD', style: 'admin' },
    { email: 'doctor@clinic.com', password: 'doctor123', role: 'Doctor', initials: 'DR', style: 'doc' },
  ];

  // Project gradient colors
  const gradientPrimary = 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)';
  const gradientLight = 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(6,182,212,0.1) 100%)';

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

        .lf-root { display: flex; max-width: 960px; width: 100%; border-radius: 18px; overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,0.12); }

        /* ── LEFT PANEL ── */
        .lf-left {
          width: 46%; position: relative; display: flex; flex-direction: column;
          justify-content: space-between; padding: 40px 38px; overflow: hidden;
          background: linear-gradient(135deg, #1e3a5f 0%, #0f2b45 100%);
        }
        .lf-orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.55; animation: lf-drift 8s ease-in-out infinite alternate; }
        .lf-orb1 { width: 280px; height: 280px; background: #2563eb; top: -80px; right: -60px; animation-delay: 0s; }
        .lf-orb2 { width: 200px; height: 200px; background: #06b6d4; bottom: 60px; left: -60px; animation-delay: -3s; }
        .lf-orb3 { width: 150px; height: 150px; background: #3b82f6; bottom: 200px; right: 20px; animation-delay: -5s; }
        @keyframes lf-drift { from { transform: translate(0,0) scale(1); } to { transform: translate(18px,24px) scale(1.08); } }
        .lf-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 40px 40px; pointer-events: none;
        }
        .lf-arc1 { position: absolute; top: -10px; right: -10px; width: 180px; height: 180px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.07); pointer-events: none; }
        .lf-arc2 { position: absolute; top: 20px; right: 20px; width: 120px; height: 120px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.05); pointer-events: none; }
        .lf-corner { position: absolute; bottom: 0; left: 0; width: 100px; height: 100px; border-top: 1.5px solid rgba(255,255,255,0.07); border-right: 1.5px solid rgba(255,255,255,0.07); border-radius: 0 60px 0 0; pointer-events: none; }
        .lf-left-content { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }

        .lf-brand { display: flex; align-items: center; gap: 12px; }
        .lf-brand-icon { width: 40px; height: 40px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); border-radius: 11px; display: flex; align-items: center; justify-content: center; }
        .lf-brand-name { color: #fff; font-size: 16px; font-weight: 600; letter-spacing: -0.2px; }

        .lf-badge { display: inline-flex; align-items: center; gap: 7px; background: rgba(6,182,212,0.15); border: 1px solid rgba(6,182,212,0.3); border-radius: 20px; padding: 5px 13px; margin-bottom: 20px; }
        .lf-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #06b6d4; animation: lf-pulse 2s ease-in-out infinite; }
        @keyframes lf-pulse { 0%,100%{opacity:1;}50%{opacity:0.4;} }
        .lf-badge-text { font-size: 11.5px; color: #67e8f9; font-weight: 500; letter-spacing: 0.4px; }

        .lf-hero-title { font-family: 'DM Serif Display', serif; font-size: 34px; line-height: 1.2; color: #fff; margin-bottom: 14px; letter-spacing: -0.5px; }
        .lf-hero-title em { font-style: italic; background: linear-gradient(135deg, #60a5fa 0%, #67e8f9 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lf-hero-sub { font-size: 13.5px; color: rgba(255,255,255,0.5); line-height: 1.7; max-width: 280px; }

        .lf-stats { display: flex; margin-top: 28px; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; background: rgba(255,255,255,0.03); }
        .lf-stat { flex: 1; padding: 16px 14px; text-align: center; border-right: 1px solid rgba(255,255,255,0.07); }
        .lf-stat:last-child { border-right: none; }
        .lf-stat-num { font-size: 22px; font-weight: 600; color: #fff; letter-spacing: -0.5px; display: block; margin-bottom: 3px; }
        .lf-stat-label { font-size: 10.5px; color: rgba(255,255,255,0.4); letter-spacing: 0.3px; }

        .lf-features { display: flex; flex-direction: column; gap: 10px; }
        .lf-feature { display: flex; align-items: center; gap: 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 13px 16px; transition: background 0.2s; cursor: default; }
        .lf-feature:hover { background: rgba(255,255,255,0.07); }
        .lf-fi { width: 34px; height: 34px; flex-shrink: 0; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
        .lf-fi-blue { background: rgba(37,99,235,0.45); }
        .lf-fi-cyan { background: rgba(6,182,212,0.3); }
        .lf-fi-teal { background: rgba(6,182,212,0.3); }
        .lf-ft { font-size: 12.5px; font-weight: 600; color: rgba(255,255,255,0.88); margin-bottom: 2px; }
        .lf-fs { font-size: 11px; color: rgba(255,255,255,0.38); }

        /* ── RIGHT PANEL ── */
        .lf-right {
          flex: 1; background: #f5f7fa; display: flex; flex-direction: column;
          justify-content: center; padding: 44px 42px; position: relative; overflow: hidden;
        }
        .lf-rbg-dots {
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(circle, #d1d9e6 1px, transparent 1px);
          background-size: 22px 22px; opacity: 0.55;
        }
        .lf-rbg-glow1 { position: absolute; top: -80px; right: -80px; width: 320px; height: 320px; border-radius: 50%; background: radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%); pointer-events: none; }
        .lf-rbg-glow2 { position: absolute; bottom: -60px; left: -60px; width: 240px; height: 240px; border-radius: 50%; background: radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%); pointer-events: none; }
        .lf-right-inner { position: relative; z-index: 1; }

        .lf-welcome-pill { display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 6px 14px 6px 8px; margin-bottom: 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .lf-wpill-avatar { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); display: flex; align-items: center; justify-content: center; }
        .lf-wpill-text { font-size: 12px; color: #4a5568; font-weight: 500; }

        .lf-right-title { font-family: 'DM Serif Display', serif; font-size: 30px; color: #0a2540; letter-spacing: -0.6px; line-height: 1.15; margin-bottom: 8px; }
        .lf-right-title em { font-style: italic; background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lf-right-sub { font-size: 13px; color: #8a94a6; line-height: 1.5; margin-bottom: 20px; }

        .lf-trust { display: flex; align-items: center; gap: 16px; margin-bottom: 26px; padding: 12px 16px; background: #fff; border: 1px solid #e8edf5; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .lf-trust-item { display: flex; align-items: center; gap: 6px; }
        .lf-trust-item span { font-size: 11px; color: #64748b; font-weight: 500; }
        .lf-trust-div { width: 1px; height: 16px; background: #e2e8f0; }

        .lf-field { margin-bottom: 16px; }
        .lf-label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
        .lf-label { font-size: 12.5px; font-weight: 600; color: #374151; letter-spacing: 0.2px; }
        .lf-forgot { font-size: 11.5px; background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 600; cursor: pointer; border: none; padding: 0; }
        .lf-forgot:hover { opacity: 0.8; }

        .lf-input-wrap { position: relative; }
        .lf-input {
          width: 100%; height: 48px; padding: 0 14px 0 46px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0a2540;
          background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; outline: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: all 0.2s;
        }
        .lf-input::placeholder { color: #b0bac8; }
        .lf-input:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37,99,235,0.09); }
        .lf-input-pass { padding-right: 46px; }

        .lf-icon-bg { position: absolute; left: 0; top: 0; bottom: 0; width: 46px; display: flex; align-items: center; justify-content: center; pointer-events: none; }
        .lf-icon-circle { width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(6,182,212,0.1) 100%); display: flex; align-items: center; justify-content: center; }

        .lf-eye { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px; opacity: 0.4; transition: opacity 0.2s; }
        .lf-eye:hover { opacity: 0.75; }

        .lf-remember { display: flex; align-items: center; gap: 8px; cursor: pointer; margin-bottom: 22px; }
        .lf-check { width: 17px; height: 17px; border: 1.5px solid #cbd5e1; border-radius: 5px; background: #fff; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
        .lf-check-on { background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); border-color: #2563eb; }
        .lf-remember-text { font-size: 12.5px; color: #64748b; user-select: none; }

        .lf-error { background: #fff5f5; border: 1.5px solid #fecaca; color: #b91c1c; font-size: 12.5px; padding: 10px 14px; border-radius: 10px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }

        .lf-submit {
          width: 100%; height: 50px;
          background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
          color: #fff; border: none; border-radius: 12px;
          font-family: 'DM Sans', sans-serif; font-size: 14.5px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          letter-spacing: 0.2px; margin-bottom: 20px;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3);
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .lf-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.4); }
        .lf-submit:active { transform: translateY(0); }
        .lf-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .lf-spin { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff; border-radius: 50%; animation: lf-spin 0.7s linear infinite; }
        @keyframes lf-spin { to { transform: rotate(360deg); } }

        .lf-divider { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .lf-div-line { flex: 1; height: 1px; background: #e2e8f0; }
        .lf-div-text { font-size: 11.5px; color: #b0bac8; white-space: nowrap; }

        .lf-demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
        .lf-demo-card { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 13px 14px; cursor: pointer; transition: all 0.2s; text-align: left; }
        .lf-demo-card:hover { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.08); transform: translateY(-1px); }
        .lf-demo-top { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
        .lf-demo-av { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #fff; }
        .lf-demo-av-admin { background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); }
        .lf-demo-av-doc   { background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); }
        .lf-demo-role  { font-size: 12px; font-weight: 600; color: #0a2540; }
        .lf-demo-email { font-size: 11px; color: #94a3b8; }

        .lf-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid #e8edf2; }
        .lf-footer-copy { font-size: 11px; color: #c0cad8; }
        .lf-footer-links { display: flex; gap: 14px; }
        .lf-footer-links a { font-size: 11px; color: #94a3b8; text-decoration: none; transition: color 0.2s; }
        .lf-footer-links a:hover { background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      <div className="lf-root">

        {/* ── LEFT PANEL ── */}
        <div className="lf-left">
          <div className="lf-orb lf-orb1" />
          <div className="lf-orb lf-orb2" />
          <div className="lf-orb lf-orb3" />
          <div className="lf-grid" />
          <div className="lf-arc1" />
          <div className="lf-arc2" />
          <div className="lf-corner" />

          <div className="lf-left-content">
            {/* Brand */}
            <div className="lf-brand">
              <div className="lf-brand-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span className="lf-brand-name">DentalCare Pro</span>
            </div>

            {/* Hero */}
            <div>
              <div className="lf-badge">
                <div className="lf-badge-dot" />
                <span className="lf-badge-text">Trusted by 500+ clinics</span>
              </div>
              <h2 className="lf-hero-title">Smarter care,<br /><em>healthier smiles.</em></h2>
              <p className="lf-hero-sub">The all-in-one clinic platform that helps dental teams deliver exceptional patient experiences every day.</p>
              <div className="lf-stats">
                <div className="lf-stat"><span className="lf-stat-num">98%</span><span className="lf-stat-label">Uptime SLA</span></div>
                <div className="lf-stat"><span className="lf-stat-num">40k+</span><span className="lf-stat-label">Patients managed</span></div>
                <div className="lf-stat"><span className="lf-stat-num">4.9★</span><span className="lf-stat-label">Avg. rating</span></div>
              </div>
            </div>

            {/* Features */}
            <div className="lf-features">
              {[
                { icon: <path d="M3 4h18v2H3zm0 4h18v2H3zm0 4h12v2H3z" />, stroke: '#60a5fa', bg: 'lf-fi-blue', title: 'Smart scheduling', sub: 'Auto-reminders & waitlist management' },
                { icon: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></>, stroke: '#67e8f9', bg: 'lf-fi-cyan', title: 'Patient records', sub: 'Full history, X-rays & treatment notes' },
                { icon: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6" /></>, stroke: '#67e8f9', bg: 'lf-fi-teal', title: 'Billing & insurance', sub: 'One-click claims & invoice generation' },
              ].map((f, i) => (
                <div key={i} className="lf-feature">
                  <div className={`lf-fi ${f.bg}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={f.stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="lf-ft">{f.title}</div>
                    <div className="lf-fs">{f.sub}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ opacity: 0.25 }}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="lf-right">
          <div className="lf-rbg-dots" />
          <div className="lf-rbg-glow1" />
          <div className="lf-rbg-glow2" />

          <div className="lf-right-inner">
            {/* Welcome pill + heading */}
            <div className="lf-welcome-pill">
              <div className="lf-wpill-avatar">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="lf-wpill-text">Welcome back to your clinic</span>
            </div>
            <h1 className="lf-right-title">Sign in to<br /><em>DentalCare Pro</em></h1>
            <p className="lf-right-sub">Enter your credentials to access your dashboard and manage your patients.</p>

            {/* Trust badges */}
            <div className="lf-trust">
              <div className="lf-trust-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <span>256-bit SSL</span>
              </div>
              <div className="lf-trust-div" />
              <div className="lf-trust-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                <span>HIPAA compliant</span>
              </div>
              <div className="lf-trust-div" />
              <div className="lf-trust-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                <span>SOC 2 certified</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="lf-field">
                <div className="lf-label-row">
                  <label className="lf-label" htmlFor="email">Email address</label>
                </div>
                <div className="lf-input-wrap">
                  <div className="lf-icon-bg">
                    <div className="lf-icon-circle">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                    </div>
                  </div>
                  <input
                    className="lf-input"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@yourclinic.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="lf-field">
                <div className="lf-label-row">
                  <label className="lf-label" htmlFor="password">Password</label>
                  <button type="button" className="lf-forgot">Forgot password?</button>
                </div>
                <div className="lf-input-wrap">
                  <div className="lf-icon-bg">
                    <div className="lf-icon-circle">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                  </div>
                  <input
                    className="lf-input lf-input-pass"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button type="button" className="lf-eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="lf-remember" onClick={() => setRememberMe(!rememberMe)}>
                <div className={`lf-check ${rememberMe ? 'lf-check-on' : ''}`}>
                  {rememberMe && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  )}
                </div>
                <span className="lf-remember-text">Keep me signed in</span>
              </div>

              {/* Error */}
              {state.error && (
                <div className="lf-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <span>{state.error}</span>
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="lf-submit" disabled={state.isLoading}>
                {state.isLoading ? (
                  <div className="lf-spin" />
                ) : (
                  <>
                    <span>Sign in to dashboard</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </>
                )}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="lf-divider">
              <div className="lf-div-line" />
              <span className="lf-div-text">Try with demo accounts</span>
              <div className="lf-div-line" />
            </div>

            <div className="lf-demo-grid">
              {demoCredentials.map((cred, i) => (
                <button
                  key={i}
                  className="lf-demo-card"
                  type="button"
                  onClick={() => { setEmail(cred.email); setPassword(cred.password); }}
                >
                  <div className="lf-demo-top">
                    <div className={`lf-demo-av lf-demo-av-${cred.style}`}>{cred.initials}</div>
                    <span className="lf-demo-role">{cred.role}</span>
                  </div>
                  <div className="lf-demo-email">{cred.email}</div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="lf-footer">
              <span className="lf-footer-copy">© 2024 DentalCare Pro</span>
              <div className="lf-footer-links">
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Support</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}












// import React, { useState } from 'react';
// import { Eye, EyeOff, Stethoscope, Mail, Lock, ArrowRight } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';

// export function LoginForm() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const { state, login } = useAuth();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     await login(email, password);
//   };

//   const demoCredentials = [
//     { email: 'admin@clinic.com', password: 'admin123', role: 'Admin/Doctor' },
//     { email: 'doctor@clinic.com', password: 'doctor123', role: 'Doctor' },
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
//       <div className="max-w-md w-full">
//         {/* Logo and Header */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl mb-4 shadow-lg">
//             <Stethoscope className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">DentalCare Pro</h1>
//           <p className="text-gray-600">Complete Clinic Management System</p>
//         </div>

//         {/* Login Form */}
//         <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                   placeholder="Enter your email"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                   placeholder="Enter your password"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//             </div>

//             {state.error && (
//               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
//                 {state.error}
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={state.isLoading}
//               className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center group disabled:opacity-50"
//             >
//               {state.isLoading ? (
//                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//               ) : (
//                 <>
//                   Sign In
//                   <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
//                 </>
//               )}
//             </button>
//           </form>

//           {/* Demo Credentials */}
//           <div className="mt-8 pt-6 border-t border-gray-200">
//             <p className="text-sm font-semibold text-gray-700 mb-3">Demo Credentials:</p>
//             <div className="space-y-2">
//               {demoCredentials.map((cred, index) => (
//                 <button
//                   key={index}
//                   onClick={() => {
//                     setEmail(cred.email);
//                     setPassword(cred.password);
//                   }}
//                   className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
//                 >
//                   <div className="font-medium text-gray-900">{cred.role}</div>
//                   <div className="text-gray-600">{cred.email}</div>
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="text-center mt-8 text-sm text-gray-500">
//           <p>© 2024 DentalCare Pro. All rights reserved.</p>
//         </div>
//       </div>
//     </div>
//   );
// }