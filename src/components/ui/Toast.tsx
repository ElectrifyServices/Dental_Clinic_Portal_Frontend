import { Toaster as HotToaster, toast as hotToast, resolveValue } from "react-hot-toast";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from "react";

// Export standard toast object to trigger toast notifications
export const toast = hotToast;

// Pre-configured premium Toaster component matching the application design system
export function Toaster() {
  return (
    <>
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .toast-enter {
          animation: toast-in 0.25s cubic-bezier(0.21, 1.02, 0.43, 1.01) forwards;
        }
        .toast-exit {
          animation: toast-out 0.18s ease-in forwards;
        }
        @keyframes toast-in {
          0% { transform: translate3d(24px, 0, 0) scale(0.95); opacity: 0; }
          100% { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
        }
        @keyframes toast-out {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0; }
        }
      `}</style>
      <HotToaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Increase duration to make toasts stay visible a bit longer
          duration: 5000,
          success: {
            duration: 5000,
          },
          error: {
            duration: 6500,
          },
        }}
      >
        {(t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";
          const message = resolveValue(t.message, t);

          return (
            <div
              className={cn(
                "relative flex items-center gap-3 w-80 p-4 rounded-xl border shadow-[0_10px_30px_rgba(15,23,42,0.08)] overflow-hidden outline-none pointer-events-auto transition-all duration-200 z-[9999] bg-white text-slate-800",
                t.visible ? "toast-enter" : "toast-exit",
                isSuccess && "border-emerald-200 bg-[#f0fdf4]", // Solid light green background (no opacity bleed)
                isError && "border-rose-200 bg-[#fff1f2]"       // Solid light red background (no opacity bleed)
              )}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
                {!isSuccess && !isError && <Info className="w-5 h-5 text-primary" />}
              </div>

              {/* Message */}
              <div className="flex-1 text-sm font-semibold text-slate-800 leading-snug">
                {message}
              </div>

              {/* Close Button */}
              <button
                onClick={() => hotToast.dismiss(t.id)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-200/50 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Running Progress Bar Line */}
              {t.duration && t.duration !== Infinity && (
                <div
                  className={cn(
                    "absolute bottom-0 left-0 h-1 bg-primary",
                    isSuccess && "bg-emerald-500",
                    isError && "bg-rose-500"
                  )}
                  style={{
                    animation: `toast-progress ${t.duration}ms linear forwards`,
                    animationPlayState: t.visible ? "running" : "paused",
                  }}
                />
              )}
            </div>
          );
        }}
      </HotToaster>
    </>
  );
}
