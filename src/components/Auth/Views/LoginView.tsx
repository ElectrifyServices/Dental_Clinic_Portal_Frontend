import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../../contexts/AuthContext";
import { loginSchema, type LoginFormData } from "@/lib/schemas/login.schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/Form";
const logoImg = "/Portal_logo.png";

interface LoginViewProps {
  setView: (view: 'login' | 'forgot' | 'forgot-sent') => void;
}

export function LoginView({ setView }: LoginViewProps) {
  const [showPw, setShowPw] = useState(false);
  const { state, login } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data.email, data.password);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header with Logo */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-24 h-24 flex items-center justify-center mb-4 transition-transform duration-500 hover:scale-105 hover:rotate-3">
          <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Welcome back
        </h1>
        <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
          Sign in to access your{" "}
          <span className="font-bold text-indigo-600">
            Electrify Services LLP.
          </span>{" "}
          Portal
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-bold text-slate-700 block mb-1.5">
                  Email address
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Mail className="w-[15px] h-[15px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-indigo-600" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="you@clinic.com"
                      autoComplete="email"
                      className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 rounded-xl"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-red-500 mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between mb-1.5">
                  <FormLabel className="text-[13px] font-bold text-slate-700">
                    Password
                  </FormLabel>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-[12px] text-indigo-600 hover:text-indigo-700 hover:bg-transparent font-bold transition-colors p-0 h-auto"
                  >
                    Forgot password?
                  </Button>
                </div>
                <FormControl>
                  <div className="relative group">
                    <Lock className="w-[15px] h-[15px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-indigo-600" />
                    <Input
                      {...field}
                      type={showPw ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="pl-10 pr-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 rounded-xl"
                    />
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 hover:bg-transparent transition-colors p-0.5 h-auto"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? (
                        <EyeOff className="w-[15px] h-[15px]" />
                      ) : (
                        <Eye className="w-[15px] h-[15px]" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-red-500 mt-1" />
              </FormItem>
            )}
          />

          {/* Error */}
          {state.error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-[13px] leading-snug animate-in fade-in zoom-in-95">
              <span className="mt-0.5 text-red-400 flex-shrink-0">⚠</span>
              <span>{state.error}</span>
            </div>
          )}

          {/* Submit Button with Logo Gradient */}
          <Button
            type="submit"
            disabled={state.isLoading || form.formState.isSubmitting}
            size="lg"
            className="w-full mt-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-700 hover:via-indigo-700 hover:to-rose-700 text-white font-extrabold shadow-lg shadow-indigo-600/25 transition-all rounded-xl h-11"
          >
            {state.isLoading || form.formState.isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign in to portal</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Demo Mode */}
      {/* <div className="mt-6 pt-5 border-t border-slate-100">
        <p className="text-center text-[10px] text-slate-400 mb-3 uppercase tracking-widest font-bold">No backend? Try demo</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            form.setValue('email', 'demo@clinic.com');
            form.setValue('password', 'demo');
            form.handleSubmit(onSubmit)();
          }}
          className="w-full border-dashed border-amber-300 bg-amber-50/30 text-amber-700 hover:bg-amber-50"
        >
          <Zap className="w-4 h-4" />
          Enter Demo Mode
        </Button>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          Uses local demo data · No internet required
        </p>
      </div> */}
    </div>
  );
}
