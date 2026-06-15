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

interface LoginViewProps {
  setView: (view: 'login' | 'forgot' | 'forgot-sent') => void;
}

export function LoginView({ setView }: LoginViewProps) {
  const [showPw, setShowPw] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
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
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Welcome back
        </h1>
        <p className="text-gray-500 text-[14px] mt-1">
          Sign in to your portal account
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
                <FormLabel className="text-[13px] font-semibold text-gray-600 block mb-1.5">
                  Email address
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Mail className="w-[15px] h-[15px] text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-500" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="you@clinic.com"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 h-11 border border-gray-200 rounded-xl text-[14px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-150"
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
                  <FormLabel className="text-[13px] font-semibold text-gray-600">
                    Password
                  </FormLabel>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-[12px] text-blue-600 hover:text-blue-700 hover:bg-transparent font-medium transition-colors p-0 h-auto"
                  >
                    Forgot password?
                  </Button>
                </div>
                <FormControl>
                  <div className="relative group">
                    <Lock className="w-[15px] h-[15px] text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-500" />
                    <Input
                      {...field}
                      type={showPw ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-11 h-11 border border-gray-200 rounded-xl text-[14px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-150"
                    />
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-transparent transition-colors p-0.5 h-auto"
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
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-[13px] leading-snug">
              <span className="mt-0.5 text-red-400 flex-shrink-0">⚠</span>
              <span>{state.error}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={state.isLoading || form.formState.isSubmitting}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-all duration-150 shadow-sm shadow-blue-200 mt-2"
          >
            {state.isLoading || form.formState.isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign in to portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Demo Mode This is just for demo purposes right now, it will be deleted later. */}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <p className="text-center text-[11px] text-gray-400 mb-3 uppercase tracking-widest font-semibold">No backend? Try demo</p>
        <button
          type="button"
          onClick={() => {
            form.setValue('email', 'demo@clinic.com');
            form.setValue('password', 'demo');
            form.handleSubmit(onSubmit)();
          }}
          className="w-full h-10 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 text-amber-700 text-[13px] font-semibold hover:bg-amber-100 transition-all duration-150"
        >
          <Zap className="w-4 h-4" />
          Enter Demo Mode
        </button>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          Uses local demo data · No internet required
        </p>
      </div>

    </div>
  );
}
