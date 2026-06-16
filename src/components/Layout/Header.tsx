import { Button } from "@/components/ui/Button";
import logo from "../../logo.png";
import {
  Bell,
  LogOut,
  Calendar,
  ChevronDown,
  Package,
  UserCheck,
  Coins,
  CalendarDays,
  CheckCheck,
  Trash2,
  Zap,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTenant } from "../../contexts/TenantContext";
import { useModal } from "../../contexts/ModalContext";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui";
import { useNotifications } from "../../hooks/useNotifications";
import { GlobalSearch } from "./GlobalSearch";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "inventory":   return Package;
    case "queue":       return UserCheck;
    case "billing":     return Coins;
    case "appointment":
    case "followup":    return CalendarDays;
    default:            return Bell;
  }
};

const getNotificationColorCls = (type: string) => {
  switch (type) {
    case "inventory":  return "bg-red-50 text-red-600";
    case "queue":      return "bg-emerald-50 text-emerald-600";
    case "billing":    return "bg-amber-50 text-amber-600";
    case "appointment":return "bg-blue-50 text-blue-600";
    case "followup":   return "bg-indigo-50 text-indigo-600";
    default:           return "bg-primary/10 text-primary";
  }
};

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  superadmin:   { label: "Super Admin",  cls: "bg-violet-50 text-violet-700 border-violet-200" },
  admin:        { label: "Admin",        cls: "bg-blue-50 text-blue-700 border-blue-200" },
  doctor:       { label: "Doctor",       cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  receptionist: { label: "Receptionist", cls: "bg-amber-50 text-amber-700 border-amber-200" },
};

export function Header() {
  const { state, logout } = useAuth();
  const { tenant } = useTenant();
  const { setActiveModal, showConfirm } = useModal();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const rm = ROLE_BADGE[state.user?.role ?? ""] ?? {
    label: state.user?.role ?? "",
    cls: "bg-muted text-muted-foreground border-border",
  };

  return (
    <header className="bg-card border-b border-border/60 px-4 sm:px-6 h-16 flex items-center gap-4 sticky top-0 z-40 flex-shrink-0 shadow-[0_2px_12px_rgba(15,23,42,0.015)]">
      {/* ── Left ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2.5 group/logo cursor-pointer">
          <div className="w-8 h-8 rounded-md bg-white border border-border/60 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover/logo:scale-110 group-hover/logo:rotate-3 overflow-hidden p-0.5">
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-foreground text-sm group-hover/logo:text-primary transition-colors">{tenant.branding.clinicName}</span>
        </div>

        {/* Today's Schedule shortcut */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveModal("todaySchedule")}
            className="gap-2 text-foreground"
          >
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Today's Schedule
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveModal("quickRegister")}
            className="gap-2 text-foreground"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Register Member
          </Button>
        </div>
      </div>

      {/* ── Center: Global Search ────────────────────────────────── */}
      <div className="flex-1 flex justify-center">
        <GlobalSearch />
      </div>
      {/* ── Right ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 flex-shrink-0">

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-bold text-white ring-2 ring-card">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-96 p-0 bg-card rounded-lg border border-border shadow-modal flex flex-col max-h-[480px]">
            {/* Notification header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                </p>
              </div>
              {notifications.length > 0 && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={markAllAsRead} title="Mark all as read"
                    className="text-primary hover:bg-primary/10 hover:text-primary">
                    <CheckCheck className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={clearAll} title="Clear all"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/60 max-h-[380px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No notifications</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = getNotificationIcon(n.type);
                  const colorCls = getNotificationColorCls(n.type);
                  return (
                    <div
                      key={n.id}
                      onClick={() => { markAsRead(n.id); if (n.link) window.location.pathname = n.link; }}
                      className={[
                        "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
                        !n.isRead ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50",
                      ].join(" ")}
                    >
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${colorCls}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold leading-snug ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap flex-shrink-0">{n.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed break-words">{n.description}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* User menu */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-muted h-auto rounded-md"
            >
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {state.user?.name?.[0] ?? "U"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {state.user?.name}
                </p>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${rm.cls}`}>
                  {rm.label}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-60 p-0 rounded-lg border border-border shadow-modal">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground truncate">{state.user?.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{state.user?.email}</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => showConfirm("Sign Out", "Are you sure you want to sign out?", async () => { await logout(); }, "Sign Out", "danger")}
              className="w-full flex items-center justify-start gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors rounded-none rounded-b-lg h-auto"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
