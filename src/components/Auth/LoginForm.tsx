import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Stethoscope, Building2, Shield, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import { loginSchema, type LoginFormData } from '@/lib/schemas/login.schema';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/Form';

const DEMO = [
  { email: 'superadmin@clinic.com', password: 'admin123', role: 'Super Admin', color: 'violet', desc: 'Manage corporate plans & full access' },
  { email: 'admin@clinic.com',      password: 'admin123', role: 'Admin / Doctor', color: 'blue',   desc: 'Full clinic management' },
  { email: 'doctor@clinic.com',     password: 'doctor123', role: 'Doctor',        color: 'emerald', desc: 'Consultations & treatments' },
  { email: 'receptionist@clinic.com', password: 'recep123', role: 'Receptionist', color: 'amber',  desc: 'Appointments & registration' },
];

const BADGE: Record<string, string> = {
  violet:  'bg-violet-100 text-violet-800 border-violet-200',
  blue:    'bg-primary/10 text-primary border-primary/30',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  amber:   'bg-amber-100 text-amber-800 border-amber-200',
};

export function LoginForm() {
  const [showPw, setShowPw] = useState(false);
  const { state, login } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data.email, data.password);
  };

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[44%] bg-gradient-to-br from-blue-700 to-blue-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-card/20 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">DentalCare Pro</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">Back-Office<br />Management Portal</h2>
          <p className="text-blue-200 text-base leading-relaxed">
            Complete dental clinic operations — appointments, patient records, billing, treatments, and corporate plans in one place.
          </p>
        </div>
        <div className="relative space-y-3">
          {[
            { icon: <Building2 className="w-4 h-4" />, text: 'Corporate Plan Management' },
            { icon: <Shield className="w-4 h-4" />, text: 'Role-Based Access Control' },
            { icon: <Users className="w-4 h-4" />, text: 'Complete Patient Lifecycle' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-blue-100">
              <div className="w-7 h-7 bg-card/20 rounded-lg flex items-center justify-center flex-shrink-0">{f.icon}</div>
              <span className="text-sm font-medium">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-foreground text-xl">DentalCare Pro</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your account to continue</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-muted-foreground">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-muted-foreground/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input {...field} type="email" placeholder="you@clinic.com"
                          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-muted-foreground">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-muted-foreground/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input {...field} type={showPw ? 'text' : 'password'} placeholder="••••••••"
                          className="w-full pl-10 pr-11 py-2.5 border border-border rounded-xl text-sm bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                        <button type="button" onClick={() => setShowPw(!showPw)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground">
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {state.error && (
                <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
                  <span>⚠</span> {state.error}
                </div>
              )}
              <button type="submit" disabled={state.isLoading || form.formState.isSubmitting}
                className="w-full bg-primary hover:bg-primary disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors mt-1">
                {state.isLoading || form.formState.isSubmitting
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </Form>

          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-muted" />
              <span className="text-muted-foreground/60 text-xs font-medium uppercase tracking-wide">Demo Accounts</span>
              <div className="flex-1 h-px bg-muted" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO.map(d => (
                <button key={d.email} onClick={() => { form.setValue('email', d.email); form.setValue('password', d.password); }}
                  className="text-left p-3 bg-card hover:bg-muted border border-border hover:border-border rounded-xl transition-all group">
                  <span className={`inline-flex text-xs font-bold px-1.5 py-0.5 rounded border mb-1 ${BADGE[d.color]}`}>{d.role}</span>
                  <p className="text-muted-foreground text-xs leading-snug">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <p className="text-center text-muted-foreground/60 text-xs mt-8">© 2025 DentalCare Pro · All rights reserved</p>
        </div>
      </div>
    </div>
  );
}
