import {
  Bell,
  LogOut,
  Calendar,
  ChevronDown,
  Stethoscope,
  Package,
  UserCheck,
  Coins,
  CalendarDays,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTenant } from "../../contexts/TenantContext";
import { useModal } from "../../contexts/ModalContext";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui";
import { useNotifications } from "../../hooks/useNotifications";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "inventory":
      return Package;
    case "queue":
      return UserCheck;
    case "billing":
      return Coins;
    case "appointment":
    case "followup":
      return CalendarDays;
    default:
      return Bell;
  }
};

const getNotificationColorCls = (type: string) => {
  switch (type) {
    case "inventory":
      return "bg-destructive/10 text-destructive";
    case "queue":
      return "bg-emerald-100 text-emerald-700";
    case "billing":
      return "bg-amber-100 text-amber-700";
    case "appointment":
      return "bg-blue-100 text-blue-700";
    case "followup":
      return "bg-indigo-100 text-indigo-700";
    default:
      return "bg-primary/10 text-primary";
  }
};

export function Header() {
  const { state, logout } = useAuth();
  const { tenant } = useTenant();
  const { setActiveModal, showConfirm } = useModal();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

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
            className="flex items-center gap-1.5 bg-background border border-border hover:border-primary hover:bg-primary/10 text-foreground text-sm font-medium px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Today's Schedule</span>
          </button>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer outline-none flex items-center justify-center">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white ring-2 ring-card animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0 bg-card/95 backdrop-blur-md rounded-2xl border border-border shadow-2xl flex flex-col max-h-[480px]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/60">
              <div>
                <h4 className="text-sm font-bold text-foreground">Notifications</h4>
                <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mt-0.5">
                  {unreadCount} Unread
                </p>
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 hover:bg-muted rounded-lg text-primary hover:text-primary-focus transition-all text-xs font-bold flex items-center gap-1"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="p-1.5 hover:bg-destructive/10 rounded-lg text-destructive hover:text-destructive-focus transition-all text-xs font-bold flex items-center gap-1"
                    title="Clear all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/50 max-h-[360px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground/20 mb-2" />
                  <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                    No Notifications
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = getNotificationIcon(n.type);
                  const colorCls = getNotificationColorCls(n.type);

                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.link) {
                          window.location.pathname = n.link;
                        }
                      }}
                      className={`flex items-start gap-3 p-4 hover:bg-muted/50 transition-all cursor-pointer border-b border-border/30 last:border-none ${!n.isRead ? "bg-primary/5" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${colorCls}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-bold ${!n.isRead ? "text-foreground font-black" : "text-muted-foreground"}`}>
                            {n.title}
                          </p>
                          <span className="text-[9px] font-semibold text-muted-foreground/50 whitespace-nowrap">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground/80 mt-1 leading-normal break-words">
                          {n.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <button
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-muted rounded-xl transition-colors cursor-pointer outline-none"
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
          </PopoverTrigger>

          <PopoverContent align="end" className="w-64 p-0">
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
                    await logout();
                  },
                  "Sign Out",
                  "danger"
                );
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-b-xl cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
