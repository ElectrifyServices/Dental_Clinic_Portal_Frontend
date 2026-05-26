import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
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

// const DEMO = [
//   {
//     email: "Software.Development@electrifyservices.com",
//     password: "Admin@123",
//     role: "Super Admin",
//     color: "violet",
//     desc: "Corporate plans & full access",
//     initial: "SA",
//   },
//   {
//     email: "clinic@gmail.com",
//     password: "Clinic@123",
//     role: "Staff",
//     color: "blue",
//     desc: "Full clinic management",
//     initial: "ST",
//   },
//   {
//     email: "vikash@gmail.com",
//     password: "Admin@123",
//     role: "Doctor",
//     color: "emerald",
//     desc: "Consultations & treatments",
//     initial: "DR",
//   },
//   {
//     email: "raj@gmail.com",
//     password: "Admin@123",
//     role: "Receptionist",
//     color: "amber",
//     desc: "Appointments & registration",
//     initial: "RC",
//   },
// ];

// const ROLE_STYLES: Record<
//   string,
//   { badge: string; avatar: string; dot: string }
// > = {
//   violet: {
//     badge: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
//     avatar: "bg-violet-100 text-violet-700",
//     dot: "bg-violet-400",
//   },
//   blue: {
//     badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
//     avatar: "bg-blue-100 text-blue-700",
//     dot: "bg-blue-400",
//   },
//   emerald: {
//     badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
//     avatar: "bg-emerald-100 text-emerald-700",
//     dot: "bg-emerald-400",
//   },
//   amber: {
//     badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
//     avatar: "bg-amber-100 text-amber-700",
//     dot: "bg-amber-400",
//   },
// };

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

  // const handleDemoSelect = (d: (typeof DEMO)[0]) => {
  //   setActiveDemo(d.email);
  //   form.setValue("email", d.email);
  //   form.setValue("password", d.password);
  // };

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
                    <input
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
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-[12px] text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <FormControl>
                  <div className="relative group">
                    <Lock className="w-[15px] h-[15px] text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-500" />
                    <input
                      {...field}
                      type={showPw ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-11 h-11 border border-gray-200 rounded-xl text-[14px] bg-gray-50 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-150"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? (
                        <EyeOff className="w-[15px] h-[15px]" />
                      ) : (
                        <Eye className="w-[15px] h-[15px]" />
                      )}
                    </button>
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
          <button
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
          </button>
        </form>
      </Form>

      {/* Demo accounts */}
      {/* <div className="mt-9">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-widest">
            Try a demo account
          </span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {DEMO.map((d) => {
            const styles = ROLE_STYLES[d.color];
            const isActive = activeDemo === d.email;
            return (
              <button
                key={d.email}
                type="button"
                onClick={() => handleDemoSelect(d)}
                className={`
                  group text-left p-3.5 rounded-xl border transition-all duration-150
                  ${isActive
                    ? "bg-blue-50 border-blue-200 shadow-sm"
                    : "bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-sm"
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${styles.avatar}`}
                  >
                    {d.initial}
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-all ${isActive
                        ? "text-blue-500 translate-x-0.5"
                        : "text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5"
                      }`}
                  />
                </div>
                <p
                  className={`text-[11px] font-bold mb-0.5 ${styles.badge.split(" ")[1]}`}
                >
                  {d.role}
                </p>
                <p className="text-gray-500 text-[11px] leading-snug">
                  {d.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div> */}
    </div>
  );
}
