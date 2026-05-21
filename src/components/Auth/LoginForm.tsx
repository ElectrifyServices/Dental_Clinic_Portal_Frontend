import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Stethoscope,
  Building2,
  Shield,
  Users,
  ChevronRight,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../contexts/AuthContext";
import { loginSchema, type LoginFormData } from "@/lib/schemas/login.schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/Form";

const DEMO = [
  {
    email: "Software.Development@electrifyservices.com",
    password: "Admin@123",
    role: "Super Admin",
    color: "violet",
    desc: "Corporate plans & full access",
    initial: "SA",
  },
  {
    email: "kunal@gmail.com",
    password: "Admin@123",
    role: "Staff",
    color: "blue",
    desc: "Full clinic management",
    initial: "ST",
  },
  {
    email: "vikash@gmail.com",
    password: "Admin@123",
    role: "Doctor",
    color: "emerald",
    desc: "Consultations & treatments",
    initial: "DR",
  },
  {
    email: "raj@gmail.com",
    password: "Admin@123",
    role: "Receptionist",
    color: "amber",
    desc: "Appointments & registration",
    initial: "RC",
  },
];

const ROLE_STYLES: Record<
  string,
  { badge: string; avatar: string; dot: string }
> = {
  violet: {
    badge: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    avatar: "bg-violet-100 text-violet-700",
    dot: "bg-violet-400",
  },
  blue: {
    badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    avatar: "bg-blue-100 text-blue-700",
    dot: "bg-blue-400",
  },
  emerald: {
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    avatar: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-400",
  },
  amber: {
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    avatar: "bg-amber-100 text-amber-700",
    dot: "bg-amber-400",
  },
};

export function LoginForm() {
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

  const handleDemoSelect = (d: (typeof DEMO)[0]) => {
    setActiveDemo(d.email);
    form.setValue("email", d.email);
    form.setValue("password", d.password);
  };

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
          <div className="mt-9">
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
          </div>
        </div>
      </div>
    </div>
  );
}









// import { useState } from "react";
// import {
//   Eye,
//   EyeOff,
//   Mail,
//   Lock,
//   ArrowRight,
//   Stethoscope,
//   Building2,
//   Shield,
//   Users,
// } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useAuth } from "../../contexts/AuthContext";
// import { loginSchema, type LoginFormData } from "@/lib/schemas/login.schema";
// import {
//   Form,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormMessage,
// } from "@/components/ui/Form";

// const DEMO = [
//   {
//     email: "Software.Development@electrifyservices.com",
//     password: "Admin@123",
//     role: "Super Admin",
//     color: "violet",
//     desc: "Manage corporate plans & full access",
//   },
//   {
//     email: "kunal@gmail.com",
//     password: "Admin@123",
//     role: "Staff",
//     color: "blue",
//     desc: "Full clinic management",
//   },
//   {
//     email: "vikash@gmail.com",
//     password: "Admin@123",
//     role: "Doctor",
//     color: "emerald",
//     desc: "Consultations & treatments",
//   },
//   {
//     email: "raj@gmail.com",
//     password: "Admin@123",
//     role: "Receptionist",
//     color: "amber",
//     desc: "Appointments & registration",
//   },
// ];

// const BADGE: Record<string, string> = {
//   violet: "bg-violet-100 text-violet-800 border-violet-200",
//   blue: "bg-primary/10 text-primary border-primary/30",
//   emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
//   amber: "bg-amber-100 text-amber-800 border-amber-200",
// };

// export function LoginForm() {
//   const [showPw, setShowPw] = useState(false);
//   const { state, login } = useAuth();

//   const form = useForm<LoginFormData>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: { email: "", password: "" },
//   });

//   const onSubmit = async (data: LoginFormData) => {
//     await login(data.email, data.password);
//   };

//   return (
//     <div className="min-h-screen bg-muted flex">
//       {/* Left branding panel */}
//       <div className="hidden lg:flex lg:w-[44%] bg-gradient-to-br from-blue-700 to-blue-900 flex-col justify-between p-12 relative overflow-hidden">
//         <div
//           className="absolute inset-0 opacity-[0.07]"
//           style={{
//             backgroundImage:
//               "radial-gradient(circle, white 1.5px, transparent 1.5px)",
//             backgroundSize: "40px 40px",
//           }}
//         />
//         <div className="relative">
//           <div className="flex items-center gap-3 mb-10">
//             <div className="w-10 h-10 bg-card/20 rounded-xl flex items-center justify-center">
//               <Stethoscope className="w-5 h-5 text-white" />
//             </div>
//             <span className="text-white font-bold text-xl">DentalCare Pro</span>
//           </div>
//           <h2 className="text-4xl font-bold text-white leading-tight mb-4">
//             Back-Office
//             <br />
//             Management Portal
//           </h2>
//           <p className="text-blue-200 text-base leading-relaxed">
//             Complete dental clinic operations — appointments, patient records,
//             billing, treatments, and corporate plans in one place.
//           </p>
//         </div>
//         <div className="relative space-y-3">
//           {[
//             {
//               icon: <Building2 className="w-4 h-4" />,
//               text: "Corporate Plan Management",
//             },
//             {
//               icon: <Shield className="w-4 h-4" />,
//               text: "Role-Based Access Control",
//             },
//             {
//               icon: <Users className="w-4 h-4" />,
//               text: "Complete Patient Lifecycle",
//             },
//           ].map((f, i) => (
//             <div key={i} className="flex items-center gap-3 text-blue-100">
//               <div className="w-7 h-7 bg-card/20 rounded-lg flex items-center justify-center flex-shrink-0">
//                 {f.icon}
//               </div>
//               <span className="text-sm font-medium">{f.text}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Right login panel */}
//       <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
//         <div className="w-full max-w-md">
//           <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
//             <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
//               <Stethoscope className="w-5 h-5 text-white" />
//             </div>
//             <span className="font-bold text-foreground text-xl">
//               DentalCare Pro
//             </span>
//           </div>

//           <div className="mb-8">
//             <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
//             <p className="text-muted-foreground text-sm mt-1">
//               Sign in to your account to continue
//             </p>
//           </div>

//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//               <FormField
//                 control={form.control}
//                 name="email"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="text-sm font-semibold text-muted-foreground">
//                       Email Address
//                     </FormLabel>
//                     <FormControl>
//                       <div className="relative">
//                         <Mail className="w-4 h-4 text-muted-foreground/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
//                         <input
//                           {...field}
//                           type="email"
//                           placeholder="you@clinic.com"
//                           className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
//                         />
//                       </div>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="password"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="text-sm font-semibold text-muted-foreground">
//                       Password
//                     </FormLabel>
//                     <FormControl>
//                       <div className="relative">
//                         <Lock className="w-4 h-4 text-muted-foreground/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
//                         <input
//                           {...field}
//                           type={showPw ? "text" : "password"}
//                           placeholder="••••••••"
//                           className="w-full pl-10 pr-11 py-2.5 border border-border rounded-xl text-sm bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setShowPw(!showPw)}
//                           className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground"
//                         >
//                           {showPw ? (
//                             <EyeOff className="w-4 h-4" />
//                           ) : (
//                             <Eye className="w-4 h-4" />
//                           )}
//                         </button>
//                       </div>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               {state.error && (
//                 <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
//                   <span>⚠</span> {state.error}
//                 </div>
//               )}
//               <button
//                 type="submit"
//                 disabled={state.isLoading || form.formState.isSubmitting}
//                 className="w-full bg-primary hover:bg-primary disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors mt-1"
//               >
//                 {state.isLoading || form.formState.isSubmitting ? (
//                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                 ) : (
//                   <>
//                     <span>Sign In</span>
//                     <ArrowRight className="w-4 h-4" />
//                   </>
//                 )}
//               </button>
//             </form>
//           </Form>

//           <div className="mt-8">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="flex-1 h-px bg-muted" />
//               <span className="text-muted-foreground/60 text-xs font-medium uppercase tracking-wide">
//                 Demo Accounts
//               </span>
//               <div className="flex-1 h-px bg-muted" />
//             </div>
//             <div className="grid grid-cols-2 gap-2">
//               {DEMO.map((d) => (
//                 <button
//                   key={d.email}
//                   onClick={() => {
//                     form.setValue("email", d.email);
//                     form.setValue("password", d.password);
//                   }}
//                   className="text-left p-3 bg-card hover:bg-muted border border-border hover:border-border rounded-xl transition-all group"
//                 >
//                   <span
//                     className={`inline-flex text-xs font-bold px-1.5 py-0.5 rounded border mb-1 ${BADGE[d.color]}`}
//                   >
//                     {d.role}
//                   </span>
//                   <p className="text-muted-foreground text-xs leading-snug">
//                     {d.desc}
//                   </p>
//                 </button>
//               ))}
//             </div>
//           </div>
//           <p className="text-center text-muted-foreground/60 text-xs mt-8">
//             © 2025 DentalCare Pro · All rights reserved
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
