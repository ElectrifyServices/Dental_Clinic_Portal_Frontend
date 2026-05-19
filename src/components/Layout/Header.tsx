import { useState, useRef, useEffect } from "react";
import { Bell, LogOut, Calendar, ChevronDown, Stethoscope } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTenant } from "../../contexts/TenantContext";
import { useModal } from "../../contexts/ModalContext";

export function Header() {
  const { state, logout } = useAuth();
  const { tenant } = useTenant();
  const { setActiveModal, showConfirm } = useModal();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onShowTodaySchedule = () => setActiveModal("todaySchedule");

  const roleMeta = () => {
    switch (state.user?.role) {
      case "superadmin":
        return {
          label: "Super Admin",
          cls: "bg-violet-100 text-violet-700 border-violet-200",
        };
      case "admin":
        return {
          label: "Admin",
          cls: "bg-primary/10 text-primary border-primary/30",
        };
      case "doctor":
        return {
          label: "Doctor",
          cls: "bg-emerald-100 text-emerald-700 border-emerald-200",
        };
      case "receptionist":
        return {
          label: "Receptionist",
          cls: "bg-amber-100 text-amber-700 border-amber-200",
        };
      default:
        return {
          label: state.user?.role || "",
          cls: "bg-muted text-muted-foreground border-border",
        };
    }
  };
  const rm = roleMeta();

  return (
    <header className="bg-card border-b border-border px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-40 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-foreground text-[15px]">
            {tenant.branding.clinicName}
          </span>
        </div>
        {/* Quick actions */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onShowTodaySchedule}
            className="flex items-center gap-1.5 bg-background border border-border hover:border-primary hover:bg-primary/10 text-foreground text-sm font-medium px-4 py-2 rounded-xl transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Today's Schedule</span>
          </button>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-muted rounded-xl transition-colors"
          >
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xs flex-shrink-0">
              {state.user?.name?.[0] ?? "U"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-semibold text-foreground leading-tight">
                {state.user?.name}
              </p>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${rm.cls}`}
              >
                {rm.label}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60 hidden sm:block" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1.5 w-64 bg-card rounded-xl shadow-xl border border-border py-1.5 z-50">
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-sm font-semibold text-foreground truncate">
                  {state.user?.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate" title={state.user?.email}>
                  {state.user?.email}
                </p>
              </div>
              <button
                onClick={() => {
                  showConfirm(
                    "Sign Out",
                    "Are you sure you want to sign out?",
                    async () => {
                      setShowMenu(false);
                      await logout();
                      // We don't show the toast here because we are redirecting to /login
                      // The modal closes immediately because showConfirm doesn't await
                    },
                    "Sign Out",
                    "danger"
                  );
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
